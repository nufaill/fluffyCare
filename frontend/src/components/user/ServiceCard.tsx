import type { PetService } from '@/types/service';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/Badge';
import { MapPin, Clock, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ServiceCardProps {
  service: PetService;
}

export const ServiceCard = ({ service }: ServiceCardProps) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/services/${service._id}`);
  };

  const formatPetTypes = (petTypes: any) => {
    if (!petTypes) return 'Not specified';
    
    if (Array.isArray(petTypes)) {
      return petTypes.map(type => {
        if (typeof type === 'object' && type.name) {
          return type.name; 
        }
        return typeof type === 'string' ? type : 'Unknown';
      }).join(', ');
    }
    
    if (typeof petTypes === 'object' && petTypes.name) {
      return petTypes.name;
    }

    if (typeof petTypes === 'string') {
      return petTypes;
    }
    
    return 'Not specified';
  };

  const formatServiceType = (serviceType: any) => {
    if (!serviceType) return 'Service';
    
    if (typeof serviceType === 'object' && serviceType.name) {
      return serviceType.name;
    }
    
    if (typeof serviceType === 'string') {
      return serviceType;
    }
    
    return 'Service';
  };

  const getServiceImage = () => {
    return service.image || '/placeholder-service.jpg';
  };

  const getShopLogo = () => {
    return service.shopId.logo || '/placeholder-logo.jpg';
  };

  const getShopName = () => {
    if (service.shopId && typeof service.shopId === 'object' && service.shopId.name) {
      return service.shopId.name;
    }
    return service.name || 'Shop Name';
  };

  const getServiceName = () => {
    return service.name ||  'Service Name';
  };

  const getLocation = () => {
    return service.shopId.city ? `${service.shopId.city}, ${service.shopId.streetAddress || ''}` : 'Location not specified';
  };

  const getDuration = () => {
    const duration = service.durationHoure ;
    return `${duration} ${duration === 1 ? 'hour' : 'hours'}`;
  };

  const getRating = () => {
    return service.rating || 0;
  };

  const getReviewCount = () => {
    return service.reviewCount || service.reviews || 0;
  };

  const getPrice = () => {
    return service.price || 0;
  };

  return (
    <Card className="overflow-hidden bg-card hover:shadow-pet-lg transition-all duration-300 hover:-translate-y-1 border-border">
      <div className="relative">
        <img
          src={getServiceImage()}
          alt={getServiceName()}
          className="w-full h-48 object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder-service.jpg';
          }}
        />
        <div className="absolute top-4 right-4">
          <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
            ₹{getPrice()}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <img
            src={getShopLogo()}
            alt={`${getShopName()} logo`}
            className="w-10 h-10 rounded-full object-cover border border-border"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder-logo.jpg';
            }}
          />
          <div>
            <h3 className="font-semibold text-card-foreground text-sm">
              {getShopName()}
            </h3>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="w-3 h-3 fill-current" />
              <span>{getRating()}</span>
              <span>({getReviewCount()})</span>
            </div>
          </div>
        </div>
        
        <h4 className="font-bold text-lg text-card-foreground mb-2">
          {getServiceName()}
        </h4>
        
        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{getLocation()}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{getDuration()}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge className="text-xs">
            {formatServiceType(service.serviceTypeId)}
          </Badge>
          <Badge className="text-xs">
            {formatPetTypes(service.petTypeIds)}
          </Badge>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Button 
          onClick={handleViewDetails}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
         View Details
        </Button>
      </CardFooter>
    </Card>
  );
};