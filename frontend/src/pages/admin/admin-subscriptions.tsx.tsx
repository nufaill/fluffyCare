"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import Navbar from "@/components/admin/Navbar"
import Sidebar from "@/components/admin/sidebar"
import AdminAxios from "@/api/admin.axios"
import { Pagination as TablePagination } from "@/components/ui/Pagination"

interface ISubscription {
    _id: string
    plan: string
    description: string
    durationInDays: number
    price: number
    profitPercentage: number
    isActive: boolean
}

interface SubscriptionResponseData {
    subscriptions: ISubscription[]
    total: number
}

interface ApiResponse<T> {
    success: boolean
    data?: T
    message?: string
}

type ViewMode = "table" | "form"

export default function AdminSubscription() {
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [subscriptions, setSubscriptions] = useState<ISubscription[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [view, setView] = useState<ViewMode>("table")
    const [editing, setEditing] = useState<ISubscription | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [totalItems, setTotalItems] = useState(0)

    useEffect(() => {
        void fetchSubscriptions(currentPage, pageSize)
    }, [currentPage, pageSize])

    useEffect(() => {
        if (view !== "form") return
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !isSubmitting) {
                cancelForm()
            }
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [view, isSubmitting])

    const totalActive = useMemo(() => subscriptions.filter((s) => s.isActive).length, [subscriptions])

     async function fetchSubscriptions(page: number, limit: number) {
        setIsLoading(true)
        setError(null)
        try {
            const res = await AdminAxios.get<ApiResponse<SubscriptionResponseData>>(`/subscriptions?page=${page}&limit=${limit}`)
            if (res.data.success && res.data.data) {
                setSubscriptions(res.data.data.subscriptions)
                setTotalItems(res.data.data.total)
            } else {
                setError(res.data.message || "Failed to load subscriptions")
            }
        } catch (err: any) {
            setError(err?.message || "Error fetching subscriptions")
        } finally {
            setIsLoading(false)
        }
    }
    async function handleToggle(id: string, to: boolean) {
        if (isSubmitting) return
        setIsSubmitting(true)
        setError(null)
        setSuccess(null)
        try {
            const res = await AdminAxios.put<ApiResponse<ISubscription>>(`/subscriptions/${id}`, {
                isActive: to,
            })
            if (res.data.success) {
                setSubscriptions((prev) => prev.map((s) => (s._id === id ? { ...s, isActive: to } : s)))
                setSuccess(`Subscription ${to ? "activated" : "deactivated"} successfully`)
            } else {
                setError(res.data.message || "Failed to toggle subscription")
            }
        } catch (err: any) {
            setError(err?.message || "Error toggling subscription")
        } finally {
            setIsSubmitting(false)
        }
    }

    async function handleSubmitForm(payload: {
        id?: string
        plan: string
        description: string
        durationInDays: number
        price: number
        profitPercentage: number
        isActive: boolean
    }) {
        if (isSubmitting) return
        setIsSubmitting(true)
        setError(null)
        setSuccess(null)
        const { id, ...body } = payload

        // Basic validation
        if (!body.plan.trim()) {
            setIsSubmitting(false)
            setError("Plan name is required")
            return
        }
        if (!body.description.trim()) {
            setIsSubmitting(false)
            setError("Description is required")
            return
        }
        if (isNaN(body.durationInDays) || body.durationInDays < 1) {
            setIsSubmitting(false)
            setError("Duration must be at least 1 day")
            return
        }
        if (isNaN(body.price) || body.price < 0) {
            setIsSubmitting(false)
            setError("Valid price is required")
            return
        }
        if (isNaN(body.profitPercentage) || body.profitPercentage < 0 || body.profitPercentage > 99) {
            setIsSubmitting(false)
            setError("Profit percentage must be between 0 and 99")
            return
        }

        try {
            if (id) {
                // Update
                const res = await AdminAxios.put<ApiResponse<ISubscription>>(`/subscriptions/${id}`, body)
                if (res.data.success && res.data.data) {
                    setSubscriptions((prev) => prev.map((s) => (s._id === id ? { ...s, ...res.data.data! } : s)))
                    setSuccess("Subscription updated successfully")
                } else {
                    setError(res.data.message || "Failed to update subscription")
                    return
                }
            } else {
                // Create
                const res = await AdminAxios.post<ApiResponse<ISubscription>>("/subscriptions", body)
                if (res.data.success && res.data.data) {
                    setSubscriptions((prev) => [res.data.data!, ...prev])
                    setSuccess("Subscription created successfully")
                } else {
                    setError(res.data.message || "Failed to create subscription")
                    return
                }
            }

            // Close form and return to table on success
            setEditing(null)
            setView("table")
        } catch (err: any) {
            setError(err?.message || (editing ? "Error updating subscription" : "Error creating subscription"))
        } finally {
            setIsSubmitting(false)
        }
    }

    function openCreate() {
        setEditing(null)
        setView("form")
        setError(null)
        setSuccess(null)
    }

    function openEdit(item: ISubscription) {
        setEditing(item)
        setView("form")
        setError(null)
        setSuccess(null)
    }

    function cancelForm() {
        setEditing(null)
        setView("table")
    }

    const handlePageChange = (page: number, newPageSize?: number) => {
        setCurrentPage(page)
        if (newPageSize) {
            setPageSize(newPageSize)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Navbar */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
                <Navbar userName="Admin" />
            </div>
            {/* Main Content Area */}
            <div className="flex flex-1 pt-16">
                {/* Sidebar */}
                <div className="fixed left-0 top-16 h-[calc(100vh-4rem)] z-40 bg-white shadow-md w-64 hidden lg:block">
                    <Sidebar />
                </div>
                {/* Main Content */}
                <div className="w-full lg:ml-64 pt-4 px-4 sm:px-6 lg:px-8">
                    <main className="p-4 sm:p-6 lg:p-8">
                        <div className="mx-auto max-w-7xl">
                            {/* Page header */}
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6">
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">Subscriptions</h1>
                                    <p className="text-gray-500 mt-1 text-sm sm:text-base">Manage your plans — create, update, and control availability.</p>
                                </div>
                                {view === "table" && (
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <button
                                            onClick={openCreate}
                                            aria-label="Open create subscription form"
                                            className="inline-flex items-center h-10 px-4 rounded-lg bg-black text-white text-sm font-medium hover:opacity-90 transition"
                                        >
                                            Create
                                        </button>
                                        <button
                                            onClick={() => void fetchSubscriptions(currentPage, pageSize)}
                                            className="inline-flex items-center h-10 px-4 rounded-lg border bg-white text-sm font-medium hover:bg-gray-50 transition"
                                        >
                                            Refresh
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Inline stats */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
                                <div className="rounded-lg border bg-white p-4">
                                    <p className="text-xs text-gray-500">Total Plans</p>
                                    <p className="mt-1 text-xl font-semibold">{subscriptions.length}</p>
                                </div>
                                <div className="rounded-lg border bg-white p-4">
                                    <p className="text-xs text-gray-500">Active</p>
                                    <p className="mt-1 text-xl font-semibold">{totalActive}</p>
                                </div>
                                <div className="rounded-lg border bg-white p-4">
                                    <p className="text-xs text-gray-500">Inactive</p>
                                    <p className="mt-1 text-xl font-semibold">{Math.max(subscriptions.length - totalActive, 0)}</p>
                                </div>
                                <div className="rounded-lg border bg-white p-4">
                                    <p className="text-xs text-gray-500">Currency</p>
                                    <p className="mt-1 text-xl font-semibold">INR</p>
                                </div>
                            </div>

                            {/* Alerts */}
                            {error && (
                                <div
                                    role="alert"
                                    className="mb-4 rounded-lg border border-red-200 bg-red-50 text-red-800 px-4 py-3 text-sm"
                                >
                                    {error}
                                </div>
                            )}
                            {success && (
                                <div
                                    role="status"
                                    className="mb-4 rounded-lg border border-green-200 bg-green-50 text-green-800 px-4 py-3 text-sm"
                                >
                                    {success}
                                </div>
                            )}

                            {/* View switcher */}
                            {view === "form" ? (
                                <div className="rounded-xl border bg-white p-4 sm:p-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
                                        <div>
                                            <h2 className="text-lg font-semibold">{editing ? "Edit subscription" : "Create subscription"}</h2>
                                            <p className="text-gray-500 text-sm">
                                                {editing ? "Update plan details and status." : "Add a new plan with pricing and profit percentage."}
                                            </p>
                                        </div>
                                        <button
                                            onClick={cancelForm}
                                            aria-label="Cancel and return to table"
                                            className="inline-flex h-9 items-center rounded-lg border bg-white px-3 text-sm font-medium hover:bg-gray-50"
                                            disabled={isSubmitting}
                                        >
                                            Cancel
                                        </button>
                                    </div>

                                    <SubscriptionForm
                                        key={editing?._id || "create-form"}
                                        initial={editing || undefined}
                                        isSubmitting={isSubmitting}
                                        onSubmit={handleSubmitForm}
                                    />
                                </div>
                            ) : (
                                <div className="rounded-xl border bg-white overflow-hidden">
                                    {/* Table */}
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <Th>Plan</Th>
                                                    <Th className="hidden md:table-cell">Description</Th>
                                                    <Th align="right">Duration (Days)</Th>
                                                    <Th align="right">Price</Th>
                                                    <Th align="center" className="hidden sm:table-cell">Profit %</Th>
                                                    <Th align="center">Status</Th>
                                                    <Th align="right">Actions</Th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {isLoading ? (
                                                    <tr>
                                                        <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                                                            <div className="inline-flex items-center gap-2">
                                                                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></span>
                                                                Loading subscriptions...
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ) : subscriptions.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                                                            No subscriptions found. Click “Create” to add your first plan.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    subscriptions.map((s) => (
                                                        <tr key={s._id} className="hover:bg-gray-50">
                                                            <Td>
                                                                <div className="font-medium text-gray-900">{s.plan}</div>
                                                                <p className="text-gray-600 text-sm md:hidden line-clamp-2 mt-1">{s.description}</p>
                                                            </Td>
                                                            <Td className="hidden md:table-cell">
                                                                <p className="text-gray-600 line-clamp-2">{s.description}</p>
                                                            </Td>
                                                            <Td align="right">{s.durationInDays}</Td>
                                                            <Td align="right">₹{Number(s.price).toFixed(2)}</Td>
                                                            <Td align="center" className="hidden sm:table-cell">{s.profitPercentage}%</Td>
                                                            <Td align="center">
                                                                <span
                                                                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${s.isActive ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}
                                                                >
                                                                    {s.isActive ? "Active" : "Inactive"}
                                                                </span>
                                                            </Td>
                                                            <Td align="right">
                                                                <div className="flex items-center gap-2 justify-end flex-wrap">
                                                                    <button
                                                                        onClick={() => openEdit(s)}
                                                                        className="inline-flex h-9 items-center rounded-lg border bg-white px-3 text-xs font-medium hover:bg-gray-50"
                                                                        disabled={isSubmitting}
                                                                    >
                                                                        Edit
                                                                    </button>
                                                                    <button
                                                                        onClick={() => void handleToggle(s._id, !s.isActive)}
                                                                        className={`inline-flex h-9 items-center rounded-lg px-3 text-xs font-medium text-white transition disabled:opacity-60 ${s.isActive ? "bg-gray-800 hover:bg-gray-900" : "bg-green-600 hover:bg-green-700"}`}
                                                                        disabled={isSubmitting}
                                                                    >
                                                                        {s.isActive ? "Deactivate" : "Activate"}
                                                                    </button>
                                                                </div>
                                                            </Td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    {/* Pagination */}
                                    <TablePagination
                                        current={currentPage}
                                        total={totalItems}
                                        pageSize={pageSize}
                                        onChange={handlePageChange}
                                        showSizeChanger={true}
                                        showQuickJumper={true}
                                        showTotal={(total, range) => (
                                            <span>
                                                Showing {range[0]}-{range[1]} of {total} plans
                                            </span>
                                        )}
                                    />
                                </div>
                            )}

                            {/* Footer note */}
                            <p className="mt-8 text-xs text-gray-500">
                                Tip: Use the Create button to add a plan. Edits reuse the same form and return you to the table on save.
                            </p>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    )
}

function Th({
    children,
    align = "left",
    className = "",
}: {
    children: React.ReactNode
    align?: "left" | "center" | "right"
    className?: string
}) {
    return (
        <th
            className={`px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-500 ${align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left"} ${className}`}
        >
            {children}
        </th>
    )
}

function Td({
    children,
    align = "left",
    className = "",
}: {
    children: React.ReactNode
    align?: "left" | "center" | "right"
    className?: string
}) {
    return (
        <td
            className={`px-4 py-4 text-sm text-gray-900 ${align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left"} ${className}`}
        >
            {children}
        </td>
    )
}

function SubscriptionForm({
    initial,
    isSubmitting,
    onSubmit,
}: {
    initial?: Partial<ISubscription>
    isSubmitting: boolean
    onSubmit: (payload: {
        id?: string
        plan: string
        description: string
        durationInDays: number
        price: number
        profitPercentage: number
        isActive: boolean
    }) => void | Promise<void>
}) {
    const [plan, setPlan] = useState(initial?.plan ?? "")
    const [description, setDescription] = useState(initial?.description ?? "")
    const [durationInDays, setDurationInDays] = useState<number>(
        typeof initial?.durationInDays === "number" ? initial.durationInDays : Number(initial?.durationInDays ?? 30)
    )
    const [price, setPrice] = useState<number>(
        typeof initial?.price === "number" ? initial.price : Number(initial?.price ?? 0)
    )
    const [profitPercentage, setProfitPercentage] = useState<number>(
        typeof initial?.profitPercentage === "number" ? initial.profitPercentage : Number(initial?.profitPercentage ?? 0)
    )
    const [isActive, setIsActive] = useState<boolean>(initial?.isActive ?? true)

    const isEdit = Boolean(initial?._id)

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        void onSubmit({
            id: initial?._id,
            plan: plan.trim(),
            description: description.trim(),
            durationInDays: Number(durationInDays),
            price: Number(price),
            profitPercentage: Number(profitPercentage),
            isActive,
        })
    }

    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
                <label htmlFor="plan" className="text-sm font-medium text-gray-800">
                    Plan
                </label>
                <input
                    id="plan"
                    name="plan"
                    value={plan}
                    onChange={(e) => setPlan(e.target.value)}
                    placeholder="Pro, Plus, Starter..."
                    className="h-10 w-full rounded-lg border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-black"
                    required
                    disabled={isSubmitting}
                    autoFocus
                />
            </div>

            <div className="grid gap-2">
                <label htmlFor="durationInDays" className="text-sm font-medium text-gray-800">
                    Duration (Days)
                </label>
                <input
                    id="durationInDays"
                    name="durationInDays"
                    type="number"
                    min={1}
                    step={1}
                    value={Number(durationInDays)}
                    onChange={(e) => setDurationInDays(Number(e.target.value))}
                    placeholder="30"
                    className="h-10 w-full rounded-lg border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-black"
                    required
                    disabled={isSubmitting}
                />
            </div>

            <div className="grid gap-2 sm:col-span-2">
                <label htmlFor="description" className="text-sm font-medium text-gray-800">
                    Description
                </label>
                <textarea
                    id="description"
                    name="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="Short description..."
                    className="w-full rounded-lg border bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-black"
                    required
                    disabled={isSubmitting}
                />
            </div>

            <div className="grid gap-2">
                <label htmlFor="price" className="text-sm font-medium text-gray-800">
                    Price
                </label>
                <div className="flex items-center gap-2">
                    <span className="inline-block rounded-lg border bg-gray-100 px-2 py-1 text-xs text-gray-600">INR</span>
                    <input
                        id="price"
                        name="price"
                        type="number"
                        min={0}
                        step="0.01"
                        value={Number(price)}
                        onChange={(e) => setPrice(Number(e.target.value))}
                        placeholder="0.00"
                        className="h-10 w-full rounded-lg border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-black"
                        required
                        disabled={isSubmitting}
                    />
                </div>
            </div>

            <div className="grid gap-2">
                <label htmlFor="profitPercentage" className="text-sm font-medium text-gray-800">
                    Profit %
                </label>
                <input
                    id="profitPercentage"
                    name="profitPercentage"
                    type="number"
                    min={0}
                    max={99}
                    step={1}
                    value={Number(profitPercentage)}
                    onChange={(e) => setProfitPercentage(Number(e.target.value))}
                    placeholder="0-99"
                    className="h-10 w-full rounded-lg border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-black"
                    required
                    disabled={isSubmitting}
                />
            </div>

            <div className="flex items-center gap-2 sm:col-span-2">
                <input
                    id="isActive"
                    name="isActive"
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    disabled={isSubmitting}
                />
                <label htmlFor="isActive" className="text-sm">
                    Active
                </label>
            </div>

            <div className="sm:col-span-2 flex items-center gap-2">
                <button
                    type="submit"
                    className="inline-flex h-10 items-center rounded-lg bg-black px-4 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (isEdit ? "Saving..." : "Creating...") : isEdit ? "Save changes" : "Create"}
                </button>
            </div>
        </form>
    )
}