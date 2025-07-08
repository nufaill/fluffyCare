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
    navigate(`/service/${service.id}`);
  };

  const formatPetTypes = (petTypes: string[]) => {
    return petTypes.map(type => type.charAt(0).toUpperCase() + type.slice(1)).join(', ');
  };

  const formatServiceType = (serviceType: string) => {
    return serviceType.charAt(0).toUpperCase() + serviceType.slice(1);
  };

  return (
    <Card className="overflow-hidden bg-card hover:shadow-pet-lg transition-all duration-300 hover:-translate-y-1 border-border">
      <div className="relative">
        <img
          src={service.serviceImage}
          alt={service.serviceName}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 right-4">
          <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
            ₹{service.price}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <img
            src={service.shopLogo}
            alt={`${service.shopName} logo`}
            className="w-10 h-10 rounded-full object-cover border border-border"
          />
          <div>
            <h3 className="font-semibold text-card-foreground text-sm">
              {service.shopName}
            </h3>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="w-3 h-3 fill-current" />
              <span>{service.rating}</span>
              <span>({service.reviewCount})</span>
            </div>
          </div>
        </div>
        
        <h4 className="font-bold text-lg text-card-foreground mb-2">
          {service.serviceName}
        </h4>
        
        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{service.location.city}, {service.location.state}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{service.duration} {service.duration === 1 ? 'hour' : 'hours'}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge  className="text-xs">
            {formatServiceType(service.serviceType)}
          </Badge>
          <Badge className="text-xs">
            {formatPetTypes(service.petTypes)}
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