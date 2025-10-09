import React, { useEffect, useMemo, useState, useCallback } from "react";
import Navbar from "@/components/admin/Navbar";
import Sidebar from "@/components/admin/sidebar";
import { Pagination as TablePagination } from "@/components/ui/Pagination";
import { Pencil, Search } from "lucide-react";
import debounce from "lodash/debounce";
import Footer from "@/components/user/Footer";

import { createBaseAxios } from '@/api/base.axios';

let  AdminAxios = createBaseAxios('/admin');

interface ISubscription {
    _id: string;
    plan: string;
    description: string;
    durationInDays: number;
    price: number;
    profitPercentage: number;
    isActive: boolean;
}

interface SubscriptionResponseData {
    subscriptions: ISubscription[];
    total: number;
}

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
}

type ViewMode = "table" | "form";

export default function AdminSubscription() {
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [subscriptions, setSubscriptions] = useState<ISubscription[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [view, setView] = useState<ViewMode>("table");
    const [editing, setEditing] = useState<ISubscription | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [search, setSearch] = useState("");
    const [formErrors, setFormErrors] = useState<Partial<Record<keyof ISubscription, string>>>({});
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // ✅ Added state for sidebar

    // Debounced fetchSubscriptions to prevent excessive API calls
    const debouncedFetchSubscriptions = useCallback(
        debounce((page: number, limit: number, searchTerm: string) => {
            fetchSubscriptions(page, limit, searchTerm);
        }, 300),
        []
    );

    useEffect(() => {
        debouncedFetchSubscriptions(currentPage, pageSize, search);
        return () => {
            debouncedFetchSubscriptions.cancel();
        };
    }, [currentPage, pageSize, search, debouncedFetchSubscriptions]);

    useEffect(() => {
        if (view !== "form") return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !isSubmitting) {
                cancelForm();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [view, isSubmitting]);

    const totalActive = useMemo(() => subscriptions.filter((s) => s.isActive).length, [subscriptions]);

    async function fetchSubscriptions(page: number, limit: number, searchTerm: string) {
        setIsLoading(true);
        setError(null);
        try {
            const query = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
            if (searchTerm) query.append("search", searchTerm);
            const res = await AdminAxios.get<ApiResponse<SubscriptionResponseData>>(`/subscriptions?${query.toString()}`);
            if (res.data.success && res.data.data) {
                setSubscriptions(res.data.data.subscriptions);
                setTotalItems(res.data.data.total);
            } else {
                setError(res.data.message || "Failed to load subscriptions");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error fetching subscriptions");
        } finally {
            setIsLoading(false);
        }
    }

    async function handleToggle(id: string, to: boolean) {
        if (isSubmitting) return;
        setIsSubmitting(true);
        setError(null);
        setSuccess(null);
        try {
            const res = await AdminAxios.put<ApiResponse<ISubscription>>(`/subscriptions/${id}`, {
                isActive: to,
            });
            if (res.data.success) {
                setSubscriptions((prev) => prev.map((s) => (s._id === id ? { ...s, isActive: to } : s)));
                setSuccess(`Subscription ${to ? "activated" : "deactivated"} successfully`);
            } else {
                setError(res.data.message || "Failed to toggle subscription");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error toggling subscription");
        } finally {
            setIsSubmitting(false);
        }
    }

    // Enhanced validation function with comprehensive error messages
    const validateForm = async (payload: {
        plan: string;
        description: string;
        durationInDays: number;
        price: number;
        profitPercentage: number;
    }, currentId?: string): Promise<Partial<Record<keyof ISubscription, string>>> => {
        const errors: Partial<Record<keyof ISubscription, string>> = {};

        // Plan validation
        const planValue = payload.plan.trim();

        // Check if plan is empty
        if (!planValue) {
            errors.plan = "Plan name is required";
        } else {
            // Check for spaces
            if (planValue.includes(' ')) {
                errors.plan = "Plan name cannot contain spaces (use: 'ProPlan' instead of 'Pro Plan')";
            }
            // Check minimum length
            else if (planValue.length < 3) {
                errors.plan = "Plan name must be at least 3 characters long (e.g., 'Pro')";
            }
            // Check maximum length
            else if (planValue.length > 20) {
                errors.plan = "Plan name cannot exceed 20 characters";
            }
            // Check for special characters (only alphanumeric allowed)
            else if (!/^[a-zA-Z0-9]+$/.test(planValue)) {
                errors.plan = "Plan name can only contain letters and numbers (e.g., 'Pro2024', not 'Pro-2024')";
            }
            // Check for duplicate plan names
            else {
                try {
                    const existingPlan = subscriptions.find(sub =>
                        sub.plan.toLowerCase() === planValue.toLowerCase() && sub._id !== currentId
                    );

                    if (existingPlan) {
                        errors.plan = `Plan name '${planValue}' already exists. Please choose a different name.`;
                    }
                } catch (error) {
                    console.warn('Could not check for duplicate plan names:', error);
                }
            }
        }

        // Description validation
        const descriptionValue = payload.description.trim();
        if (!descriptionValue) {
            errors.description = "Description is required. Please provide a brief summary of the plan.";
        } else if (descriptionValue.length < 10) {
            errors.description = "Description must be at least 10 characters long for clarity.";
        } else if (descriptionValue.length > 500) {
            errors.description = "Description cannot exceed 500 characters.";
        }

        // Duration validation
        if (isNaN(payload.durationInDays)) {
            errors.durationInDays = "Duration must be a valid number";
        } else if (payload.durationInDays < 1) {
            errors.durationInDays = "Duration must be at least 1 day (e.g., 30 for a month)";
        } else if (payload.durationInDays > 3650) {
            errors.durationInDays = "Duration cannot exceed 3650 days (10 years)";
        } else if (!Number.isInteger(payload.durationInDays)) {
            errors.durationInDays = "Duration must be a whole number (no decimal places)";
        }

        // Price validation
        if (isNaN(payload.price)) {
            errors.price = "Price must be a valid number";
        } else if (payload.price < 0) {
            errors.price = "Price cannot be negative (minimum: 0.00)";
        } else if (payload.price > 999999.99) {
            errors.price = "Price cannot exceed ₹999,999.99";
        } else if (payload.price > 0 && payload.price < 0.01) {
            errors.price = "Price must be at least ₹0.01 if not free";
        }

        // Profit percentage validation
        if (isNaN(payload.profitPercentage)) {
            errors.profitPercentage = "Profit percentage must be a valid number";
        } else if (payload.profitPercentage < 0) {
            errors.profitPercentage = "Profit percentage cannot be negative (minimum: 0%)";
        } else if (payload.profitPercentage > 99) {
            errors.profitPercentage = "Profit percentage cannot exceed 99% (maximum: 99%)";
        } else if (!Number.isInteger(payload.profitPercentage)) {
            errors.profitPercentage = "Profit percentage must be a whole number (e.g., 50, not 50.5)";
        }

        return errors;
    };

    async function handleSubmitForm(payload: {
        id?: string;
        plan: string;
        description: string;
        durationInDays: number;
        price: number;
        profitPercentage: number;
        isActive: boolean;
    }) {
        if (isSubmitting) return;
        setIsSubmitting(true);
        setError(null);
        setSuccess(null);
        setFormErrors({});

        const errors = await validateForm(payload, payload.id);
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            setIsSubmitting(false);
            return;
        }

        const { id, ...body } = payload;

        try {
            if (id) {
                const res = await AdminAxios.put<ApiResponse<ISubscription>>(`/subscriptions/${id}`, body);
                if (res.data.success && res.data.data) {
                    setSubscriptions((prev) => prev.map((s) => (s._id === id ? { ...s, ...res.data.data! } : s)));
                    setSuccess("Subscription updated successfully");
                } else {
                    setError(res.data.message || "Failed to update subscription");
                    return;
                }
            } else {
                const res = await AdminAxios.post<ApiResponse<ISubscription>>("/subscriptions", body);
                if (res.data.success && res.data.data) {
                    setSubscriptions((prev) => [res.data.data!, ...prev]);
                    setTotalItems(prev => prev + 1);
                    setSuccess("Subscription created successfully");
                } else {
                    setError(res.data.message || "Failed to create subscription");
                    return;
                }
            }

            setEditing(null);
            setView("table");
            setIsSidebarOpen(false); // ✅ Close sidebar after form submission
        } catch (err) {
            if (err instanceof Error && err.message.includes('Plan name already exists')) {
                setFormErrors({ plan: "Plan name already exists. Please choose a different name." });
            } else {
                setError(err instanceof Error ? err.message : (editing ? "Error updating subscription" : "Error creating subscription"));
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    function openCreate() {
        setEditing(null);
        setView("form");
        setError(null);
        setSuccess(null);
        setFormErrors({});
    }

    function openEdit(item: ISubscription) {
        setEditing(item);
        setView("form");
        setError(null);
        setSuccess(null);
        setFormErrors({});
    }

    function cancelForm() {
        setEditing(null);
        setView("table");
        setFormErrors({});
        setIsSidebarOpen(false); // ✅ Close sidebar when canceling form
    }

    const handlePageChange = (page: number, newPageSize?: number) => {
        setCurrentPage(page);
        if (newPageSize) {
            setPageSize(newPageSize);
        }
    };

    const handleMenuItemClick = (itemId: string) => {
        setIsSidebarOpen(false); // ✅ Close sidebar on menu item click
    };

    const handleLogout = () => {
        setIsSidebarOpen(false); // ✅ Close sidebar on logout
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
                <Navbar
                    userName="NUFAIL"
                    isSidebarOpen={isSidebarOpen}
                    onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                />
            </div>
            <div className="flex flex-1 pt-16">
                <Sidebar
                    activeItem={subscriptions.length > 0 ? "subscription" : undefined}
                    onItemClick={handleMenuItemClick}
                    onLogout={handleLogout}
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                />
                <div className="w-full lg:ml-64 pt-4 px-4 sm:px-6 lg:px-8">
                    <main className="p-4 sm:p-6 lg:p-8">
                        <div className="mx-auto max-w-7xl">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6">
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">Subscriptions</h1>
                                    <p className="text-gray-500 mt-1 text-sm sm:text-base">Manage your plans — create, update, and control availability.</p>
                                </div>
                                {view === "table" && (
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                placeholder="Search plans or descriptions..."
                                                className="h-10 w-full sm:w-64 rounded-lg border bg-white pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-black"
                                            />
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        </div>
                                        <button
                                            onClick={openCreate}
                                            aria-label="Open create subscription form"
                                            className="inline-flex items-center h-10 px-4 rounded-lg bg-black text-white text-sm font-medium hover:opacity-90 transition"
                                        >
                                            Create
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
                                <div className="rounded-lg border bg-white p-4">
                                    <p className="text-xs text-gray-500">Total Plans</p>
                                    <p className="mt-1 text-xl font-semibold">{totalItems}</p>
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
                                        formErrors={formErrors}
                                        onSubmit={handleSubmitForm}
                                    />
                                </div>
                            ) : (
                                <div className="rounded-xl border bg-white overflow-hidden">
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
                                                            No subscriptions found. Click "Create" to add your first plan.
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
                                                                <div className="flex items-center gap-3 justify-end flex-wrap">
                                                                    <button
                                                                        onClick={() => openEdit(s)}
                                                                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border bg-white hover:bg-gray-50"
                                                                        disabled={isSubmitting}
                                                                        title="Edit"
                                                                    >
                                                                        <Pencil className="w-4 h-4 text-gray-700" />
                                                                    </button>
                                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={s.isActive}
                                                                            onChange={() => void handleToggle(s._id, !s.isActive)}
                                                                            disabled={isSubmitting}
                                                                            className="sr-only peer"
                                                                        />
                                                                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-green-600 transition-colors"></div>
                                                                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                                                                    </label>
                                                                </div>
                                                            </Td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
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
                        </div>
                    </main>
                </div>
            </div>
                    <div className="ml-64 p-6">
                        <Footer />
                    </div>
        </div>
    );
}

function Th({
    children,
    align = "left",
    className = "",
}: {
    children: React.ReactNode;
    align?: "left" | "center" | "right";
    className?: string;
}) {
    return (
        <th
            className={`px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-500 ${align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left"} ${className}`}
        >
            {children}
        </th>
    );
}

function Td({
    children,
    align = "left",
    className = "",
}: {
    children: React.ReactNode;
    align?: "left" | "center" | "right";
    className?: string;
}) {
    return (
        <td
            className={`px-4 py-4 text-sm text-gray-900 ${align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left"} ${className}`}
        >
            {children}
        </td>
    );
}

function SubscriptionForm({
    initial,
    isSubmitting,
    formErrors,
    onSubmit,
}: {
    initial?: Partial<ISubscription>;
    isSubmitting: boolean;
    formErrors: Partial<Record<keyof ISubscription, string>>;
    onSubmit: (payload: {
        id?: string;
        plan: string;
        description: string;
        durationInDays: number;
        price: number;
        profitPercentage: number;
        isActive: boolean;
    }) => void | Promise<void>;
}) {
    const [plan, setPlan] = useState(initial?.plan ?? "");
    const [description, setDescription] = useState(initial?.description ?? "");
    const [durationInDays, setDurationInDays] = useState<number>(
        typeof initial?.durationInDays === "number" ? initial.durationInDays : Number(initial?.durationInDays ?? 30)
    );
    const [price, setPrice] = useState<number>(
        typeof initial?.price === "number" ? initial.price : Number(initial?.price ?? 0)
    );
    const [profitPercentage, setProfitPercentage] = useState<number>(
        typeof initial?.profitPercentage === "number" ? initial.profitPercentage : Number(initial?.profitPercentage ?? 0)
    );
    const [isActive, setIsActive] = useState<boolean>(initial?.isActive ?? true);

    const isEdit = Boolean(initial?._id);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        void onSubmit({
            id: initial?._id,
            plan: plan.trim(),
            description: description.trim(),
            durationInDays: Number(durationInDays),
            price: Number(price),
            profitPercentage: Number(profitPercentage),
            isActive,
        });
    }

    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
                <label htmlFor="plan" className="text-sm font-medium text-gray-800">
                    Plan Name <span className="text-red-500">*</span>
                </label>
                <input
                    id="plan"
                    name="plan"
                    value={plan}
                    onChange={(e) => setPlan(e.target.value)}
                    placeholder="Pro, Plus, Starter (3-20 chars, alphanumeric only)"
                    className={`h-10 w-full rounded-lg border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-black ${formErrors.plan ? "border-red-500" : ""}`}
                    required
                    disabled={isSubmitting}
                    autoFocus
                    pattern="[a-zA-Z0-9]{3,20}"
                    title="Plan name must be 3-20 characters, alphanumeric only, no spaces or special characters"
                />
                {formErrors.plan && (
                    <p className="text-xs text-red-600">{formErrors.plan}</p>
                )}
                <p className="text-xs text-gray-500">Must be unique, no spaces, 3-20 characters, letters & numbers only</p>
            </div>

            <div className="grid gap-2">
                <label htmlFor="durationInDays" className="text-sm font-medium text-gray-800">
                    Duration (Days) <span className="text-red-500">*</span>
                </label>
                <input
                    id="durationInDays"
                    name="durationInDays"
                    type="number"
                    min={1}
                    max={3650}
                    step={1}
                    value={Number(durationInDays)}
                    onChange={(e) => setDurationInDays(Number(e.target.value))}
                    placeholder="30 (1-3650 days)"
                    className={`h-10 w-full rounded-lg border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-black ${formErrors.durationInDays ? "border-red-500" : ""}`}
                    required
                    disabled={isSubmitting}
                />
                {formErrors.durationInDays && (
                    <p className="text-xs text-red-600">{formErrors.durationInDays}</p>
                )}
                <p className="text-xs text-gray-500">Whole numbers only, 1-3650 days (up to 10 years)</p>
            </div>

            <div className="grid gap-2 sm:col-span-2">
                <label htmlFor="description" className="text-sm font-medium text-gray-800">
                    Description <span className="text-red-500">*</span>
                </label>
                <textarea
                    id="description"
                    name="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="Brief description of the plan (10-500 characters)"
                    className={`w-full rounded-lg border bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-black ${formErrors.description ? "border-red-500" : ""}`}
                    required
                    disabled={isSubmitting}
                    minLength={10}
                    maxLength={500}
                />
                {formErrors.description && (
                    <p className="text-xs text-red-600">{formErrors.description}</p>
                )}
                <p className="text-xs text-gray-500">10-500 characters required for clarity</p>
            </div>

            <div className="grid gap-2">
                <label htmlFor="price" className="text-sm font-medium text-gray-800">
                    Price <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                    <span className="inline-block rounded-lg border bg-gray-100 px-2 py-1 text-xs text-gray-600">INR</span>
                    <input
                        id="price"
                        name="price"
                        type="number"
                        min={0}
                        max={999999.99}
                        step="0.01"
                        value={Number(price)}
                        onChange={(e) => setPrice(Number(e.target.value))}
                        placeholder="0.00 (₹0.00-₹999,999.99)"
                        className={`h-10 w-full rounded-lg border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-black ${formErrors.price ? "border-red-500" : ""}`}
                        required
                        disabled={isSubmitting}
                    />
                </div>
                {formErrors.price && (
                    <p className="text-xs text-red-600">{formErrors.price}</p>
                )}
                <p className="text-xs text-gray-500">₹0.00-₹999,999.99, minimum ₹0.01 if not free</p>
            </div>

            <div className="grid gap-2">
                <label htmlFor="profitPercentage" className="text-sm font-medium text-gray-800">
                    Profit Percentage <span className="text-red-500">*</span>
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
                    placeholder="50 (0-99%)"
                    className={`h-10 w-full rounded-lg border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-black ${formErrors.profitPercentage ? "border-red-500" : ""}`}
                    required
                    disabled={isSubmitting}
                />
                {formErrors.profitPercentage && (
                    <p className="text-xs text-red-600">{formErrors.profitPercentage}</p>
                )}
                <p className="text-xs text-gray-500">Whole numbers only, 0-99% range</p>
            </div>

            <div className="flex items-center gap-2 sm:col-span-2">
                <input
                    id="isActive"
                    name="isActive"
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    disabled={isSubmitting}
                    className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                    Active (plan will be available for selection)
                </label>
            </div>

            <div className="sm:col-span-2 flex items-center gap-2 pt-4 border-t">
                <button
                    type="submit"
                    className="inline-flex h-10 items-center rounded-lg bg-black px-4 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                            {isEdit ? "Saving..." : "Creating..."}
                        </>
                    ) : (
                        isEdit ? "Save Changes" : "Create Plan"
                    )}
                </button>

                {!isSubmitting && (
                    <p className="text-xs text-gray-500">
                        Press Escape to cancel or click Cancel button above
                    </p>
                )}
            </div>
        </form>
    );
}