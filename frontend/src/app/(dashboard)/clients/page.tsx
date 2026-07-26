'use client'

import React, { useState, useMemo } from 'react'
import {
  Client,
  ClientFormData,
  ClientFormErrors,
  ClientFilterState,
  DEFAULT_FORM_DATA
} from '../../../lib/clients/types'
import { initialClients } from '../../../lib/clients/mockData'
import { validateClientForm, filterClients, sanitizeFormData } from '../../../lib/clients/helpers'
import { AddClientForm } from '../../../components/clients/ClientForm'
import { ClientList } from '../../../components/clients/ClientList'

export default function ClientsPage() {
  // State management for clients, form
  const [clients, setClients] = useState<Client[]>(initialClients)
  const [form, setForm] = useState<ClientFormData>(DEFAULT_FORM_DATA)
  const [editingId, setEditingId] = useState<string | number | null>(null)

  // State management for form errors, server
  const [errors, setErrors] = useState<ClientFormErrors>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isLoadingClients, setIsLoadingClients] = useState<boolean>(false)

  // State management for filters
  const [filters, setFilters] = useState<ClientFilterState>({
    searchQuery: '',
    channel: 'all',
    tone: 'all',
  })

  const isEditMode = Boolean(editingId)

  const handleFormChange = (updates: Partial<ClientFormData>) => {
    setForm(prev => ({ ...prev, ...updates }))
    setServerError(null)
    const fieldKeys = Object.keys(updates) as (keyof ClientFormData)[]
    if (fieldKeys.length > 0) {
      setErrors(prev => {
        const newErrors = { ...prev }
        fieldKeys.forEach(k => delete newErrors[k])
        return newErrors
      })
    }
  }


  const handleEditClient = (client: Client) => {
    setEditingId(client.id)
    setForm({
      company: client.company,
      contact: client.contact,
      email: client.email,
      phone: client.phone,
      paymentTerms: client.paymentTerms,
      channel: client.channel,
      tone: client.tone,
      notes: client.notes || '',
    })
    setErrors({})
    setServerError(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }


  const handleSaveClient = async () => {
    const validationErrors = validateClientForm(form)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }


    const cleanPayload = sanitizeFormData(form)
    setIsSubmitting(true)
    setServerError(null)

    try {
      if (isEditMode && editingId) {
        await new Promise(resolve => setTimeout(resolve, 500))

        setClients(prev =>
          prev.map(c => {
            if (c.id === editingId) {
              return {
                ...c,
                ...cleanPayload,
                updatedAt: new Date().toISOString(),
              }
            }
            return c
          })
        )
      } else {
        // Create new client
        await new Promise(resolve => setTimeout(resolve, 500))

        const createdClientFromApi: Client = {
          id: `db_id_${Math.random().toString(36).substring(2, 9)}`,
          ...cleanPayload,
          status: 'active',
          createdAt: new Date().toISOString(),
        }

        setClients(prev => [createdClientFromApi, ...prev])
      }

      setForm(DEFAULT_FORM_DATA)
      setEditingId(null)
      setErrors({})
    } catch (err: any) {
      setServerError(err?.message || 'Failed to save client. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }


  const handleCancel = () => {
    setForm(DEFAULT_FORM_DATA)
    setEditingId(null)
    setErrors({})
    setServerError(null)
  }

  const handleDeleteClient = async (id: string | number) => {
    if (confirm('Are you sure you want to delete this client?')) {
      try {
        setClients(prev => prev.filter(c => c.id !== id))
        if (editingId === id) {
          handleCancel()
        }
      } catch (err) {
        alert('Failed to delete client')
      }
    }
  }


  const filteredClients = useMemo(() => {
    return filterClients(clients, filters)
  }, [clients, filters])

  return (
    <div className="min-h-screen bg-slate-50 px-4 pt-2 pb-6 sm:px-6 sm:pt-3 sm:pb-8 lg:px-8 lg:pt-3 lg:pb-10 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-3">
            <AddClientForm
              form={form}
              errors={errors}
              serverError={serverError}
              isSubmitting={isSubmitting}
              isEditMode={isEditMode}
              onChange={handleFormChange}
              onSave={handleSaveClient}
              onCancel={handleCancel}
            />
          </div>

          <div className="lg:col-span-7 xl:col-span-8">
            <ClientList
              clients={filteredClients}
              filters={filters}
              isLoading={isLoadingClients}
              onFilterChange={updates => setFilters(prev => ({ ...prev, ...updates }))}
              onEditClient={handleEditClient}
              onDeleteClient={handleDeleteClient}
              onAddInvoice={client => alert(`Add invoice for ${client.company}`)}
            />
          </div>

        </div>

      </div>
    </div>
  )
}