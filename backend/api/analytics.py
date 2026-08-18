"""
Analytics router for aggregated invoice metrics.

Endpoints:
  GET /api/v1/analytics/summary       - Get aggregated totals by status
  GET /api/v1/analytics/status/{status} - Get totals for a specific status
  GET /api/v1/analytics/trend         - Get collection trend by month

All data is queried from Supabase invoice table and aggregated in real-time.
"""
from typing import List
from fastapi import APIRouter, HTTPException, Query
from datetime import datetime
import logging

from app.schemas.schemas import AnalyticsResponse, InvoiceStatusAggregate, CollectionTrendResponse
from app.services.analytics_service import (
    get_invoice_analytics,
    get_collection_trend,
)

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Analytics"])


@router.get("/analytics", response_model=List[dict])
async def get_analytics():
    """
    Get list of all invoices from Supabase.
    Returns individual invoice records for display in tables/dashboards.
    """
    try:
        logger.info("Fetching all invoices from Supabase...")
        from config import SUPABASE_URL, SUPABASE_KEY
        from supabase import create_client
        
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        response = supabase.table("invoices").select("*").execute()
        invoices = response.data if response.data else []
        
        logger.info(f"✓ Fetched {len(invoices)} invoices")
        return invoices
    except Exception as e:
        logger.error(f"✗ Error fetching invoices: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch invoices: {str(e)}"
        )

@router.get("/analytics/summary", response_model=AnalyticsResponse)
async def get_analytics_summary():
    """
    Get aggregated invoice totals grouped by status.
    
    Returns invoice counts, total amounts, and averages for each status
    from the Supabase invoice table.
    
    Response:
        - byStatus: List of status aggregates (status, totalAmount, count, averageAmount)
        - totalAmount: Sum of all invoice amounts
        - totalInvoices: Total count of invoices
        - generatedAt: ISO timestamp of when data was generated
    """
    try:
        data = await get_invoice_analytics()

        by_status = []
        total_amount = 0.0
        total_invoices = 0

        # Process the dictionary returned from service
        for status, status_data in data.items():
            total_amount += status_data["totalAmount"]
            total_invoices += status_data["count"]
            
            by_status.append(
                InvoiceStatusAggregate(
                    status=status_data["status"],
                    totalAmount=status_data["totalAmount"],
                    count=status_data["count"],
                    averageAmount=round(status_data["totalAmount"] / status_data["count"], 2) if status_data["count"] > 0 else 0.0
                )
            )

        return AnalyticsResponse(
            byStatus=by_status,
            totalAmount=total_amount,
            totalInvoices=total_invoices,
            generatedAt=datetime.utcnow().isoformat() + "Z",
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch analytics: {str(e)}"
        )


@router.get("/analytics/trend", response_model=CollectionTrendResponse)
async def get_analytics_trend():
    """
    Get collection trend data grouped by month for the last 6 months.
    
    Aggregates:
    - collected: Total amount paid (from payments table by payment_date)
    - outstanding: Total unpaid invoice amounts (invoices with status != paid/completed)
    
    Response:
        - trend: List of monthly data with month, collected, outstanding
        - generatedAt: ISO timestamp of when data was generated
    """
    logger.info("=" * 60)
    logger.info("ENDPOINT: GET /analytics/trend")
    logger.info("=" * 60)
    
    try:
        logger.info("→ Calling get_collection_trend()...")
        data = await get_collection_trend()
        
        logger.info("✓ Service returned data:")
        logger.info(f"  Type: {type(data)}")
        logger.info(f"  Keys: {data.keys() if isinstance(data, dict) else 'N/A'}")
        logger.info(f"  data['trend'] type: {type(data.get('trend'))}")
        logger.info(f"  data['trend'] length: {len(data.get('trend', [])) if data.get('trend') else 0}")
        logger.info(f"  data['trend']: {data.get('trend')}")
        logger.info(f"  data['generatedAt']: {data.get('generatedAt')}")
        
        logger.info("→ Creating CollectionTrendResponse...")
        result = CollectionTrendResponse(
            trend=data["trend"],
            generatedAt=data["generatedAt"],
        )
        
        logger.info("✓ Response created successfully:")
        logger.info(f"  result.trend type: {type(result.trend)}")
        logger.info(f"  result.trend length: {len(result.trend)}")
        logger.info(f"  result.trend: {result.trend}")
        logger.info(f"  result.generatedAt: {result.generatedAt}")
        
        logger.info("=" * 60)
        logger.info("ENDPOINT: /analytics/trend - SUCCESS")
        logger.info("=" * 60)
        
        return result
        
    except Exception as e:
        logger.error("=" * 60)
        logger.error("ENDPOINT: /analytics/trend - ERROR")
        logger.error("=" * 60)
        error_msg = f"Failed to fetch collection trend: {str(e)}"
        logger.error(f"✗ {error_msg}", exc_info=True)
        logger.error("=" * 60)
        raise HTTPException(
            status_code=500,
            detail=error_msg
        )


