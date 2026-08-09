'use client'

import React, { useState, useMemo, useEffect } from 'react'
import {
  Client,
  ClientFormData,
  ClientFormErrors,
  ClientFilterState,
  DEFAULT_FORM_DATA
} from '../../../lib/clients/types'
import { validateClientForm, filterClients, sanitizeFormData } from '../../../lib/clients/helpers'
import { createClient, deleteClient, listClients, updateClient } from '../../../lib/clients/api'
import { AddClientForm } from '../../../components/clients/ClientForm'
import { ClientList } from '../../../components/clients/ClientList'

export default function ClientsPage() {
  // State management for clients, form
  const [clients, setClients] = useState<Client[]>([])
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

  // Keep the form in edit mode while a client ID is selected
  const isEditMode = editingId !== null

  useEffect(() => {
    let isMounted = true
    setIsLoadingClients(true)

    listClients()
      .then(loadedClients => {
        if (isMounted) setClients(loadedClients)
      })
      .catch(err => {
        if (isMounted) setServerError(err instanceof Error ? err.message : 'Failed to load clients.')
      })
      .finally(() => {
        if (isMounted) setIsLoadingClients(false)
      })

    // Prevent state updates if the component unmounts before the request finishes
    return () => {
      isMounted = false
    }
  }, [])

  // Update form values and clear validation errors for edited fields
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


  // Populate the form with the selected client's data for editing
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


  // Validate, sanitize, and submit the form data to create or update a client
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
      if (isEditMode && editingId !== null) {
        const updatedClient = await updateClient(editingId, cleanPayload)
        setClients(prev => prev.map(client => client.id === editingId ? updatedClient : client))
      } else {
        const createdClientFromApi = await createClient(cleanPayload)
        setClients(prev => [createdClientFromApi, ...prev])
      }


      // Reset form and editing state after successful save
      setForm(DEFAULT_FORM_DATA)
      setEditingId(null)
      setErrors({})
    } catch (err: any) {
      setServerError(err?.message || 'Failed to save client. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }


  // Reset the form and editing state when the user cancels editing
  const handleCancel = () => {
    setForm(DEFAULT_FORM_DATA)
    setEditingId(null)
    setErrors({})
    setServerError(null)
  }

  // Confirm deletion and remove the client from the list if successful
  const handleDeleteClient = async (id: string | number) => {
    if (confirm('Are you sure you want to delete this client?')) {
      try {
        await deleteClient(id)
        setClients(prev => prev.filter(c => c.id !== id))
        if (editingId === id) {
          handleCancel()
        }
      } catch (err) {
        alert('Failed to delete client')
      }
    }
  }


  // Memoize the filtered clients to avoid unnecessary recalculations on every render
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
