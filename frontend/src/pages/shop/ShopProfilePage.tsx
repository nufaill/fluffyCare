import { useState, useEffect } from 'react';
import { PetCareLayout } from '@/components/layout/PetCareLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/Badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Separator } from '@/components/ui/separator';
import {
    MapPin,
    Phone,
    Mail,
    Edit,
    Save,
    X,
    Shield,
    Calendar,
    Building,
    Camera,
    FileText,
    CheckCircle
} from 'lucide-react';
import { Navbar } from '@/components/shop/Navbar';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { shopService } from '@/services/shop/shop.service';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { RootState } from '@/redux/store';

// Define validation schema using Zod
const shopSchema = z.object({
    name: z.string().min(3, 'Shop name must be at least 3 characters').max(100, 'Shop name must be less than 100 characters'),
    phone: z.string().regex(/^\+?[\d\s-]{10,}$/, 'Please enter a valid phone number'),
    city: z.string().min(2, 'City must be at least 2 characters').max(100, 'City must be less than 100 characters'),
    streetAddress: z.string().min(5, 'Street address must be at least 5 characters').max(200, 'Street address must be less than 200 characters'),
    description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
    logo: z.string().url('Must be a valid URL').optional().or(z.literal('')),
    location: z.object({
        type: z.literal('Point'),
        coordinates: z.tuple([z.number(), z.number()])
    }).optional()
});

type ShopFormData = z.infer<typeof shopSchema>;

export default function ShopProfilePage() {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    const { shopData: shop } = useSelector((state: RootState) => state.shop);
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors }, reset } = useForm<ShopFormData>({
        resolver: zodResolver(shopSchema),
        defaultValues: {
            name: '',
            phone: '',
            city: '',
            streetAddress: '',
            description: '',
            logo: '',
            location: { type: 'Point', coordinates: [0, 0] }
        }
    });

    useEffect(() => {
        if (shop) {
            reset({
                name: shop.name,
                phone: shop.phone,
                city: shop.city,
                streetAddress: shop.streetAddress,
                description: shop.description,
                logo: shop.logo,
                location: shop.location
            });
        }
    }, [shop, reset]);

    const onSubmit = async (data: ShopFormData) => {
        if (!shop?._id) {
            toast.error('Shop ID not found');
            return;
        }

        setLoading(true);
        try {
            await shopService.editShop(shop._id, data);
            setIsEditing(false);
            toast.success('Profile updated successfully');

            // Refresh the page to show updated data
            navigate(0); // This triggers a page refresh
        } catch (error) {
            console.error('Error updating shop profile:', error);
            toast.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        reset();
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (!shop) {
        return (
            <PetCareLayout>
                <Navbar />
                <div className="flex justify-center items-center min-h-screen">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-4">Loading Profile...</h2>
                        <p className="text-muted-foreground">Please wait while we load your shop profile.</p>
                    </div>
                </div>
            </PetCareLayout>
        );
    }

    return (
        <PetCareLayout>
            <Navbar />
            <div className="p-8 max-w-6xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="fade-slide-in">
                    <Card className="bg-white border-0 shadow-lg">
                        <CardContent className="p-8">
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <div className="flex flex-col md:flex-row items-start gap-8">
                                    {/* Logo Section */}
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="relative">
                                            <Avatar className="h-32 w-32 border-4 border-gray-100 shadow-lg">
                                                <AvatarImage src={shop.logo} alt={shop.name} />
                                                <AvatarFallback className="bg-black text-white text-3xl font-bold">
                                                    {shop.name.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            {isEditing && (
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    className="absolute -bottom-2 -right-2 bg-black text-white hover:bg-gray-800 rounded-full h-8 w-8 p-0"
                                                >
                                                    <Camera className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {shop.isVerified && (
                                                <Badge className="bg-green-100 text-green-800 border-green-200">
                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                    Verified
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    {/* Basic Info Section */}
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                {isEditing ? (
                                                    <div className="space-y-2">
                                                        <Label htmlFor="name">Shop Name</Label>
                                                        <Input
                                                            id="name"
                                                            {...register('name')}
                                                            className="text-2xl font-bold h-12"
                                                        />
                                                        {errors.name && (
                                                            <p className="text-red-500 text-sm">{errors.name.message}</p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <h1 className="text-3xl font-bold text-foreground">{shop.name}</h1>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {isEditing ? (
                                                    <>
                                                        <Button
                                                            type="submit"
                                                            disabled={loading}
                                                            className="bg-black text-white hover:bg-gray-800"
                                                        >
                                                            <Save className="h-4 w-4 mr-2" />
                                                            {loading ? 'Saving...' : 'Save'}
                                                        </Button>
                                                        <Button type="button" onClick={handleCancel} variant="outline" disabled={loading}>
                                                            <X className="h-4 w-4 mr-2" />
                                                            Cancel
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <Button onClick={() => navigate(`/shop/profile/update`)} variant="outline">
                                                        <Edit className="h-4 w4 mr-2" />
                                                        Edit Profile
                                                    </Button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Contact Information */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="flex items-center gap-3 text-muted-foreground">
                                                <Mail className="h-4 w-4" />
                                                <span>{shop.email}</span>
                                            </div>

                                            <div className="flex items-center gap-3 text-muted-foreground">
                                                <Phone className="h-4 w-4" />
                                                {isEditing ? (
                                                    <div className="space-y-2 w-full">
                                                        <Input
                                                            {...register('phone')}
                                                            type="tel"
                                                        />
                                                        {errors.phone && (
                                                            <p className="text-red-500 text-sm">{errors.phone.message}</p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span>{shop.phone}</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Location */}
                                        <div className="flex items-start gap-3 text-muted-foreground">
                                            <MapPin className="h-4 w-4 mt-1" />
                                            <div className="space-y-2 flex-1">
                                                {isEditing ? (
                                                    <>
                                                        <div className="space-y-2">
                                                            <Input
                                                                {...register('streetAddress')}
                                                                placeholder="Street Address"
                                                            />
                                                            {errors.streetAddress && (
                                                                <p className="text-red-500 text-sm">{errors.streetAddress.message}</p>
                                                            )}
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Input
                                                                {...register('city')}
                                                                placeholder="City"
                                                            />
                                                            {errors.city && (
                                                                <p className="text-red-500 text-sm">{errors.city.message}</p>
                                                            )}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div>
                                                        <p>{shop.streetAddress}</p>
                                                        <p>{shop.city}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Description Section */}
                    <div className="lg:col-span-2 fade-slide-in" style={{ animationDelay: '0.1s' }}>
                        <Card className="bg-white border-0 shadow-lg h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building className="h-5 w-5" />
                                    About Our Shop
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isEditing ? (
                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            {...register('description')}
                                            rows={6}
                                            className="resize-none"
                                        />
                                        {errors.description && (
                                            <p className="text-red-500 text-sm">{errors.description.message}</p>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground leading-relaxed">{shop.description}</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Side Information */}
                    <div className="space-y-6">
                        {/* Verification Status */}
                        <div className="fade-slide-in" style={{ animationDelay: '0.2s' }}>
                            <Card className="bg-white border-0 shadow-lg">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="h-5 w-5" />
                                        Verification Status
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Account Status</span>
                                            <Badge className={shop.isVerified ? "bg-green-100 text-green-800 border-green-200" : "bg-yellow-100 text-yellow-800 border-yellow-200"}>
                                                {shop.isVerified ? "Verified" : "Pending"}
                                            </Badge>
                                        </div>

                                        <Separator />

                                        <div className="flex items-center gap-3">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">Certificate</p>
                                                <p className="text-xs text-muted-foreground">Professional certification</p>
                                            </div>
                                            <Button size="sm" variant="outline">
                                                View
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Account Information */}
                        <div className="fade-slide-in" style={{ animationDelay: '0.3s' }}>
                            <Card className="bg-white border-0 shadow-lg">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5" />
                                        Account Info
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm font-medium text-foreground">Member Since</p>
                                            <p className="text-sm text-muted-foreground">
                                                {shop.createdAt ? formatDate(shop.createdAt) : 'N/A'}
                                            </p>
                                        </div>

                                        <Separator />

                                        <div>
                                            <p className="text-sm font-medium text-foreground">Last Updated</p>
                                            <p className="text-sm text-muted-foreground">
                                                {shop.updatedAt ? formatDate(shop.updatedAt) : 'N/A'}
                                            </p>
                                        </div>

                                        <Separator />

                                        <div>
                                            <p className="text-sm font-medium text-foreground">Shop ID</p>
                                            <p className="text-xs text-muted-foreground font-mono">{shop._id}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Location Coordinates */}
                        <div className="fade-slide-in" style={{ animationDelay: '0.4s' }}>
                            <Card className="bg-gray-50 border-0 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-sm">Location Coordinates</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {shop.location?.coordinates ? (
                                            <>
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-muted-foreground">Longitude:</span>
                                                    <span className="font-mono">{shop.location.coordinates[0]}</span>
                                                </div>
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-muted-foreground">Latitude:</span>
                                                    <span className="font-mono">{shop.location.coordinates[1]}</span>
                                                </div>
                                            </>
                                        ) : (
                                            <p className="text-xs text-muted-foreground">Location not available</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </PetCareLayout>
    );
}