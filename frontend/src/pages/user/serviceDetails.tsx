 import Useraxios from '@/api/user.axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from '@/components/user/Header';
import Footer from '@/components/user/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/Badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, MapPin, Phone, Mail, Star, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { PetService } from '@/types/service';
import { cloudinaryUtils } from '@/utils/cloudinary/cloudinary';

export const ServiceDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<PetService | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServiceDetails = async () => {
      if (!id) {
        console.log('No ID provided');
        setError('No service ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log('Fetching service with ID:', id);
        const response = await Useraxios.get(`/services/${id}`);
        console.log('API Response Status:', response.status);
        console.log('API Response Headers:', response.headers);
        console.log('API Response Body:', response.data);
        if (response.status !== 200) {
          throw new Error(`Failed to fetch service details: ${response.statusText}`);
        }
        setService(response.data.data || response.data);
      } catch (err: any) {
        console.error('Fetch Error:', err);
        setError(err.response?.data?.message || err.message || 'An error occurred');
      } finally {
        setLoading(false);
        console.log('Final State - Loading:', loading, 'Error:', error, 'Service:', service);
      }
    };

    fetchServiceDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading service details...</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Alert className="mb-6 border-destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-destructive">
              {error || 'Service not found'}
            </AlertDescription>
          </Alert>
          <div className="text-center">
            <Button onClick={() => navigate('/services')}>
              Back to Services
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const formatPetTypes = (petTypes: any[]) => {
    if (!petTypes || petTypes.length === 0) return 'All pets';
    return petTypes.map(pet => 
      typeof pet === 'string' ? pet.charAt(0).toUpperCase() + pet.slice(1) : pet.name
    ).join(', ');
  };

  const renderStars = (rating: number) => {
    const validRating = rating || 0;
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(validRating) ? 'fill-current text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/services')}
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Services
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Image */}
            <div className="relative rounded-lg overflow-hidden">
              <img
                src={service.image || '/api/placeholder/600/400'}
                alt={service.name}
                className="w-full h-64 md:h-80 object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/api/placeholder/600/400';
                }}
              />
              <div className="absolute top-4 right-4">
                <Badge className="bg-background/90 backdrop-blur-sm text-foreground">
                  ₹{service.price}
                </Badge>
              </div>
            </div>

            {/* Service Info */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={cloudinaryUtils.getFullUrl(service.shopId.logo)}
                    alt={`${service.shopId?.name || 'Shop'} logo`}
                    className="w-16 h-16 rounded-full object-cover border border-border"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/api/placeholder/64/64';
                    }}
                  />
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-card-foreground mb-1">
                      {service.name}
                    </h1>
                    <p className="text-lg text-muted-foreground mb-2">
                      {service.shopId?.name || 'Unknown Shop'}
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        {renderStars(service.rating || 0)}
                        <span className="ml-1 text-sm text-muted-foreground">
                          {service.rating || 0} ({service.reviewCount || 0} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Service Type</p>
                    <p className="font-medium text-card-foreground capitalize">
                      {typeof service.serviceTypeId === 'string' 
                        ? service.serviceTypeId 
                        : service.serviceTypeId?.name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-medium text-card-foreground">
                      {service.durationHour} {service.durationHour === 1 ? 'hour' : 'hours'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pet Types</p>
                    <p className="font-medium text-card-foreground">
                      {formatPetTypes(service.petTypeIds)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Price</p>
                    <p className="font-medium text-card-foreground">
                      ₹{service.price}
                    </p>
                  </div>
                </div>

                <Separator className="my-4" />

                <div>
                  <h3 className="font-semibold text-card-foreground mb-2">Description</h3>
                  <p className="text-muted-foreground">
                    {service.description || 'No description available.'}
                  </p>
                </div>

                <Separator className="my-4" />

                <div>
                  <h3 className="font-semibold text-card-foreground mb-2">Status</h3>
                  <Badge variant={service.isActive ? "default" : "secondary"}>
                    {service.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-card-foreground mb-4">
                  Reviews ({service.reviewCount || 0})
                </h3>
                
                {service.reviewCount && service.reviewCount > 0 ? (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {/* This would be populated with actual review data */}
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        Review details will be loaded here from the API
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No reviews yet. Be the first to leave a review!
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Shop Details */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-card-foreground mb-4">Shop Details</h3>
                
                <div className="space-y-3">
                  {service.shopId?.streetAddress && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-card-foreground">{service.shopId.streetAddress}</p>
                        {service.shopId.city && (
                          <p className="text-muted-foreground text-sm">
                            {service.shopId.city}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {service.shopId?.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-muted-foreground" />
                      <a 
                        href={`tel:${service.shopId.phone}`}
                        className="text-card-foreground hover:text-primary"
                      >
                        {service.shopId.phone}
                      </a>
                    </div>
                  )}
                  
                  {service.shopId?.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-muted-foreground" />
                      <a 
                        href={`mailto:${service.shopId.email}`}
                        className="text-card-foreground hover:text-primary"
                      >
                        {service.shopId.email}
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Book Service Button */}
            <Card>
              <CardContent className="p-6">
                <Button 
                  className="w-full" 
                  size="lg"
                  disabled={!service.isActive}
                >
                  {service.isActive ? 'Book Service' : 'Service Unavailable'}
                </Button>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Duration: {service.durationHour} {service.durationHour === 1 ? 'hour' : 'hours'}
                </p>
              </CardContent>
            </Card>

            {/* Location Map Placeholder */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-card-foreground mb-4">Location</h3>
                <div className="bg-muted rounded-lg h-40 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Interactive map would show here
                    </p>
                    {service.shopId?.city && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {service.shopId.city}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};