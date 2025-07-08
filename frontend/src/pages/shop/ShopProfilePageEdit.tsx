
import { useEffect, useState } from 'react';
import { PetCareLayout } from '@/components/layout/PetCareLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Camera } from 'lucide-react';
import { Navbar } from '@/components/shop/Navbar';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { shopService } from '@/services/shop/shop.service';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { RootState } from '@/redux/store';
import { useDispatch } from 'react-redux';
import { addShop } from '@/redux/slices/shop.slice';

// Define validation schema using Zod
const shopSchema = z.object({
    name: z.string().min(3, 'Shop name must be at least 3 characters').max(100, 'Shop name must be less than 100 characters'),
    phone: z.string().regex(/^\+?[\d\s-]{10,}$/, 'Please enter a valid phone number'),
    city: z.string().min(2, 'City must be at least 2 characters').max(100, 'City must be less than 100 characters'),
    streetAddress: z.string().min(5, 'Street address must be at least 5 characters').max(200, 'Street address must be less than 200 characters'),
    description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
    logo: z.string().optional() // Logo is a base64 string or empty
});

type ShopFormData = z.infer<typeof shopSchema>;

export default function ShopEditPage() {
    const { shopData: shop } = useSelector((state: RootState) => state.shop);
    const navigate = useNavigate();
    const [previewLogo, setPreviewLogo] = useState<string | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch()

    const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<ShopFormData>({
        resolver: zodResolver(shopSchema),
        defaultValues: {
            name: '',
            phone: '',
            city: '',
            streetAddress: '',
            description: '',
            logo: ''
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
                logo: shop.logo || ''
            });
            setPreviewLogo(shop.logo || null);
        } else {
            // If no shop data, redirect to profile
            toast.error('Shop data not found. Please try again.');
            navigate('/shop/profile');
        }
    }, [shop, reset, navigate]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
            setFileError('Please upload a valid image file (PNG, JPG, or JPEG)');
            return;
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > maxSize) {
            setFileError('File size must be less than 5MB');
            return;
        }

        // Convert file to base64
        const reader = new FileReader();
        reader.onload = () => {
            const base64String = reader.result as string;
            setValue('logo', base64String);
            setPreviewLogo(base64String);
            setFileError(null);
            console.log('Logo uploaded as base64:', base64String.substring(0, 50) + '...');
        };
        reader.onerror = () => {
            setFileError('Error reading the file');
            console.error('FileReader error');
        };
        reader.readAsDataURL(file);
    };

    const onSubmit = async (data: ShopFormData) => {
        console.log('Form submitted with data:', data);

        try {
            setLoading(true);
            const payload = {
                ...data,
                logo: data.logo || undefined
            };
            console.log('Sending payload to API:', payload);

            // Call the updated service method without shopId
            const shopData = await shopService.editShop(payload);
            console.log(shopData)
            dispatch(addShop(shopData))
            toast.success('Profile updated successfully');
            navigate('/shop/profile');
        } catch (error) {
            console.error('API error details:', error);
            toast.error('Failed to update profile: ' + (error instanceof Error ? error.message : 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        console.log('Cancel button clicked');
        navigate('/shop/profile');
    };

    if (!shop || loading) {
        return (
            <PetCareLayout>
                <Navbar />
                <div className="flex justify-center items-center min-h-screen">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-4">Loading...</h2>
                        <p className="text-muted-foreground">Please wait while we load the shop data.</p>
                    </div>
                </div>
            </PetCareLayout>
        );
    }


    return (
        <PetCareLayout>
            <Navbar />
            <div className="p-8 max-w-4xl mx-auto">
                <Card className="bg-white border-0 shadow-lg">
                    <CardHeader>
                        <CardTitle>Edit Shop Profile</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            {/* Logo Section */}
                            <div className="space-y-2">
                                <Label>Shop Logo</Label>
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <Avatar className="h-24 w-24 border-4 border-gray-100 shadow-lg">
                                            <AvatarImage src={previewLogo || shop.logo} alt={shop.name} />
                                            <AvatarFallback className="bg-black text-white text-2xl font-bold">
                                                {shop.name.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <Button
                                            type="button"
                                            size="sm"
                                            className="absolute -bottom-2 -right-2 bg-black text-white hover:bg-gray-800 rounded-full h-8 w-8 p-0"
                                            onClick={() => document.getElementById('logo-upload')?.click()}
                                        >
                                            <Camera className="h-4 w-4" />
                                        </Button>
                                        <Input
                                            id="logo-upload"
                                            type="file"
                                            accept="image/png,image/jpeg,image/jpg"
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />
                                    </div>
                                </div>
                                {fileError && (
                                    <p className="text-red-500 text-sm">{fileError}</p>
                                )}
                                {errors.logo && (
                                    <p className="text-red-500 text-sm">{errors.logo.message}</p>
                                )}
                            </div>

                            {/* Shop Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name">Shop Name</Label>
                                <Input
                                    id="name"
                                    {...register('name')}
                                    className="h-10"
                                />
                                {errors.name && (
                                    <p className="text-red-500 text-sm">{errors.name.message}</p>
                                )}
                            </div>

                            {/* Phone */}
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    {...register('phone')}
                                    type="tel"
                                    className="h-10"
                                />
                                {errors.phone && (
                                    <p className="text-red-500 text-sm">{errors.phone.message}</p>
                                )}
                            </div>

                            {/* Street Address */}
                            <div className="space-y-2">
                                <Label htmlFor="streetAddress">Street Address</Label>
                                <Input
                                    id="streetAddress"
                                    {...register('streetAddress')}
                                    placeholder="Street Address"
                                    className="h-10"
                                />
                                {errors.streetAddress && (
                                    <p className="text-red-500 text-sm">{errors.streetAddress.message}</p>
                                )}
                            </div>

                            {/* City */}
                            <div className="space-y-2">
                                <Label htmlFor="city">City</Label>
                                <Input
                                    id="city"
                                    {...register('city')}
                                    placeholder="City"
                                    className="h-10"
                                />
                                {errors.city && (
                                    <p className="text-red-500 text-sm">{errors.city.message}</p>
                                )}
                            </div>

                            {/* Description */}
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

                            {/* Form Actions */}
                            <div className="flex items-center gap-2">
                                <Button
                                    type="submit"
                                    className="bg-black text-white hover:bg-gray-800"
                                    disabled={loading || !shop}
                                    onClick={() => console.log('Save button clicked')}
                                >
                                    {loading ? 'Saving...' : 'Save'}
                                </Button>
                                <Button
                                    type="button"
                                    onClick={handleCancel}
                                    variant="outline"
                                    disabled={loading}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </PetCareLayout>
    );
}