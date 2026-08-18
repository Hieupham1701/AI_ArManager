"""
Analytics Service — Aggregates invoice data from Supabase.

Provides functions to:
  - Get invoice totals grouped by status
  - Get collection trend by month
  - Filter by date range or other criteria
  - Calculate summary statistics
"""

from datetime import datetime, timedelta
from typing import List, Dict, Any
import logging
from supabase import Client, create_client

from config import SUPABASE_URL, SUPABASE_KEY
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Supabase client
try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    logger.info(f"✓ Supabase client initialized with URL: {SUPABASE_URL}")
except Exception as e:
    logger.error(f"✗ Failed to initialize Supabase: {e}")
    supabase = None


async def get_collection_trend() -> Dict[str, Any]:
    """
    Fetch collection trend data for the last 6 months.
    Groups invoices and payments by month.
    
    Returns:
        Dictionary with list of monthly trend data
    """
    try:
        if not supabase:
            raise Exception("Supabase client not initialized")
        
        logger.info("=" * 60)
        logger.info("START: get_collection_trend()")
        logger.info("=" * 60)
        
        # Get all invoices
        logger.info("→ Fetching invoices...")
        invoices_response = supabase.table("invoices").select("invoice_id, amount, status").execute()
        invoices = invoices_response.data if invoices_response.data else []
        logger.info(f"✓ Fetched {len(invoices)} invoices")
        logger.info(f"  Sample invoice: {invoices[0] if invoices else 'None'}")
        
        # Get all payments
        logger.info("→ Fetching payments...")
        payments_response = supabase.table("payments").select("amount, payment_date").execute()
        payments = payments_response.data if payments_response.data else []
        logger.info(f"✓ Fetched {len(payments)} payments")
        logger.info(f"  Sample payment: {payments[0] if payments else 'None'}")
        
        # Generate last 6 months
        logger.info("→ Generating last 6 months...")
        trend_data = {}
        now = datetime.utcnow()
        logger.info(f"  Current UTC time: {now}")
        
        for i in range(5, -1, -1):
            month_date = now - timedelta(days=30 * i)
            month_key = month_date.strftime("%Y-%m")
            trend_data[month_key] = {
                "month": month_key,
                "collected": 0.0,
                "outstanding": 0.0,
            }
        logger.info(f"✓ Generated {len(trend_data)} months: {list(trend_data.keys())}")
        
        # Calculate collected amount from payments
        logger.info("→ Processing payments...")
        for idx, payment in enumerate(payments):
            try:
                payment_date = payment.get("payment_date")
                amount = float(payment.get("amount", 0)) or 0.0
                
                logger.debug(f"  Payment {idx}: date={payment_date}, amount={amount}")
                
                if payment_date:
                    # Parse payment date
                    if isinstance(payment_date, str):
                        payment_month = payment_date[:7]  # Extract YYYY-MM
                    else:
                        payment_month = payment_date.strftime("%Y-%m")
                    
                    logger.debug(f"    → Mapped to month: {payment_month}")
                    
                    if payment_month in trend_data:
                        trend_data[payment_month]["collected"] += amount
                        logger.debug(f"    ✓ Added to {payment_month}: +${amount}")
                    else:
                        logger.warning(f"    ⚠ Month {payment_month} not in trend_data range")
            except Exception as e:
                logger.warning(f"Error processing payment {idx}: {e}")
                continue
        
        logger.info(f"✓ Processed {len(payments)} payments")
        logger.info(f"  Collected by month: {[(k, v['collected']) for k, v in trend_data.items()]}")
        
        # Calculate outstanding amount (invoices not paid)
        logger.info("→ Processing invoices...")
        outstanding_count = 0
        for idx, invoice in enumerate(invoices):
            try:
                invoice_status = invoice.get("status", "").lower()
                amount = float(invoice.get("amount", 0)) or 0.0
                
                logger.debug(f"  Invoice {idx}: status={invoice_status}, amount={amount}")
                
                # If status is not "paid" or "completed", it's outstanding
                if invoice_status not in ["paid", "completed"]:
                    # Assign to current month as outstanding
                    current_month = datetime.utcnow().strftime("%Y-%m")
                    if current_month in trend_data:
                        trend_data[current_month]["outstanding"] += amount
                        outstanding_count += 1
                        logger.debug(f"    ✓ Added to {current_month} outstanding: +${amount}")
                    else:
                        logger.warning(f"    ⚠ Current month {current_month} not in trend_data")
            except Exception as e:
                logger.warning(f"Error processing invoice {idx}: {e}")
                continue
        
        logger.info(f"✓ Processed {len(invoices)} invoices ({outstanding_count} outstanding)")
        logger.info(f"  Outstanding by month: {[(k, v['outstanding']) for k, v in trend_data.items()]}")
        
        # Round all amounts
        logger.info("→ Rounding amounts...")
        for month_key in trend_data:
            trend_data[month_key]["collected"] = round(trend_data[month_key]["collected"], 2)
            trend_data[month_key]["outstanding"] = round(trend_data[month_key]["outstanding"], 2)
        
        result = {
            "trend": list(trend_data.values()),
            "generatedAt": datetime.utcnow().isoformat() + "Z",
        }
        
        logger.info("✓ Final result:")
        logger.info(f"  trend count: {len(result['trend'])}")
        logger.info(f"  trend data: {result['trend']}")
        logger.info(f"  generatedAt: {result['generatedAt']}")
        logger.info("=" * 60)
        logger.info("END: get_collection_trend() - SUCCESS")
        logger.info("=" * 60)
        
        return result
    
    except Exception as e:
        logger.error("=" * 60)
        logger.error("ERROR: get_collection_trend() FAILED")
        logger.error("=" * 60)
        logger.error(f"✗ Error in get_collection_trend: {str(e)}", exc_info=True)
        logger.error("=" * 60)
        raise




async def get_invoice_analytics() -> Dict[str, Any]:
    """
    Fetch invoices from Supabase and aggregate by status.
    
    Returns:
        Dictionary with status-specific aggregate data
    """
    filter_status = ["Overdue", "Critical", "Paid", "In Progress", "Escalated"]
    try:
        if not supabase:
            raise Exception("Supabase client not initialized")
        
        # First, get all invoices to see what statuses exist
        response_all = supabase.table("invoices").select("status").execute()
        all_invoices = response_all.data if response_all.data else []
        unique_statuses = set(inv.get("status") for inv in all_invoices if inv.get("status"))
        logger.info(f"✓ Found {len(all_invoices)} total invoices with statuses: {unique_statuses}")
        
        # Query invoices with specific status
        analytics_data = {}
        for status in filter_status:
            try:
                response = supabase.table("invoices").select("*").eq("status", status).execute()
                invoices = response.data if response.data else []

                total_amount = 0.0
                for invoice in invoices:
                    amount = float(invoice.get("amount", 0)) or 0.0
                    total_amount += amount

                analytics_data[status] = {
                    "status": status,
                    "totalAmount": round(total_amount, 2),
                    "count": len(invoices),
                    "generatedAt": datetime.utcnow().isoformat() + "Z",
                }
                logger.info(f"✓ Fetched {len(invoices)} invoices with status '{status}'")
            except Exception as status_error:
                logger.error(f"✗ Error fetching status '{status}': {status_error}")
                # Continue with other statuses even if one fails
                analytics_data[status] = {
                    "status": status,
                    "totalAmount": 0.0,
                    "count": 0,
                    "generatedAt": datetime.utcnow().isoformat() + "Z",
                }

        return analytics_data
    
    except Exception as e:
        logger.error(f"✗ Error in get_invoice_analytics: {str(e)}")
        logger.error(f"Analytics error: {str(e)}")
        raise
