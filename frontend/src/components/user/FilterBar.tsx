import { useState, useEffect } from 'react';
import type { FilterOptions } from '@/types/service';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, SlidersHorizontal, Search, X, Navigation } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { userService } from '@/services/user/user.service';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

interface FilterBarProps {
  filters: FilterOptions;
  onFiltersChange: (filters: Partial<FilterOptions>) => void;
  onToggleMap?: () => void;
  showMap?: boolean;
  userLocation?: { lat: number; lng: number } | null;
}

const durationOptions = [
  { value: 0.5, label: '30 min' },
  { value: 1, label: '1 hour' },
  { value: 2, label: '2 hours' },
  { value: 3, label: '3 hours' },
  { value: 4, label: '4 hours' },
  { value: 6, label: '6 hours' },
  { value: 8, label: '8 hours' },
  { value: 12, label: '12 hours' },
  { value: 24, label: '24 hours' },
];

const ratingOptions = [
  { value: 0, label: 'Any rating', description: 'Show all services' },
  { value: 3, label: '3+ stars', description: 'Good services' },
  { value: 4, label: '4+ stars', description: 'Excellent services' },
  { value: 5, label: '5 stars', description: 'Outstanding services' },
];

const radiusOptions = [
  { value: 1000, label: '1 km' },
  { value: 2000, label: '2 km' },
  { value: 5000, label: '5 km' },
  { value: 10000, label: '10 km' },
  { value: 20000, label: '20 km' },
  { value: 50000, label: '50 km' },
];

export const FilterBar = ({ filters, onFiltersChange, onToggleMap, showMap, userLocation }: FilterBarProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [petTypeOptions, setPetTypeOptions] = useState<{ value: string; label: string }[]>([]);
  const [serviceTypeOptions, setServiceTypeOptions] = useState<{ value: string; label: string }[]>([]);
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [pets, services] = await Promise.all([
          userService.getAllPetTypes(),
          userService.getAllServiceTypes(),
        ]);
        setPetTypeOptions(
          pets.map((p) => ({
            value: p.name,
            label: p.name.charAt(0).toUpperCase() + p.name.slice(1),
          }))
        );
        setServiceTypeOptions(
          services.map((s) => ({
            value: s.name,
            label: s.name.charAt(0).toUpperCase() + s.name.slice(1),
          }))
        );
      } catch (err) {
        console.error('Failed to fetch pet/service types:', err);
      }
    };

    fetchOptions();
  }, []);

  useEffect(() => {
    setSearchInput(filters.search || '');
  }, [filters.search]);

  const requestLocationAccess = async () => {
    try {
      if ('geolocation' in navigator) {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        if (permission.state === 'denied') {
          toast({
            title: 'Location Access Denied',
            description: 'Please enable location access in your browser settings to use the Nearby Shops feature.',
            variant: 'destructive',
          });
          return false;
        }
        return new Promise<boolean>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            () => resolve(true),
            () => {
              toast({
                title: 'Location Access Required',
                description: 'Please allow location access to use the Nearby Shops feature.',
                variant: 'destructive',
              });
              resolve(false);
            }
          );
        });
      } else {
        toast({
          title: 'Geolocation Not Supported',
          description: 'Your browser does not support geolocation. The Nearby Shops feature is unavailable.',
          variant: 'destructive',
        });
        return false;
      }
    } catch (err) {
      console.error('Error requesting location:', err);
      toast({
        title: 'Error',
        description: 'Failed to request location access. Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const handlePetTypeChange = (petType: string, checked: boolean) => {
    const newPetTypes = checked
      ? [...filters.petType, petType]
      : filters.petType.filter((type) => type !== petType);
    onFiltersChange({ petType: newPetTypes });
  };

  const handleServiceTypeChange = (serviceType: string, checked: boolean) => {
    const newServiceTypes = checked
      ? [...filters.serviceType, serviceType]
      : filters.serviceType.filter((type) => type !== serviceType);
    onFiltersChange({ serviceType: newServiceTypes });
  };

  const handlePriceRangeChange = (value: number[]) => {
    onFiltersChange({ priceRange: value as [number, number] });
  };

  const handleMinDurationChange = (value: string) => {
    const num = parseFloat(value);
    const newDuration = [num, Math.max(num, filters.duration[1])] as [number, number];
    onFiltersChange({ duration: newDuration });
  };

  const handleMaxDurationChange = (value: string) => {
    const num = parseFloat(value);
    const newDuration = [Math.min(filters.duration[0], num), num] as [number, number];
    onFiltersChange({ duration: newDuration });
  };

  const handleRatingChange = (rating: string) => {
    const ratingValue = parseFloat(rating);
    onFiltersChange({ rating: ratingValue });
  };

  const handleNearbyToggle = async (checked: boolean) => {
    if (checked && !userLocation) {
      const locationGranted = await requestLocationAccess();
      if (!locationGranted) {
        return; 
      }
    }
    onFiltersChange({
      nearMe: checked,
      radius: checked ? (filters.radius || 5000) : undefined,
    });
  };

  const handleRadiusChange = (value: string) => {
    const radiusValue = parseFloat(value);
    onFiltersChange({ radius: radiusValue });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      onFiltersChange({ search: value });
    }, 300);

    setSearchTimeout(timeout);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    onFiltersChange({ search: '' });
  };

  const clearFilters = () => {
    setSearchInput('');
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    onFiltersChange({
      petType: [],
      serviceType: [],
      priceRange: [0, 20000],
      duration: [0, 24],
      rating: 0,
      nearMe: false,
      search: '',
      radius: undefined,
      currentAvailability: false,
      selectedDay: '',
      selectedTime: '',
    });
  };

  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const activeFiltersCount =
    filters.petType.length +
    filters.serviceType.length +
    (filters.rating > 0 ? 1 : 0) +
    (filters.nearMe ? 1 : 0) +
    (filters.search ? 1 : 0) +
    (filters.currentAvailability ? 1 : 0) +
    (filters.selectedDay ? 1 : 0) +
    (filters.selectedTime ? 1 : 0);

  const getCurrentRatingLabel = () => {
    const option = ratingOptions.find((opt) => opt.value === filters.rating);
    return option ? option.label : 'Any rating';
  };

  const getCurrentRadiusLabel = () => {
    const option = radiusOptions.find((opt) => opt.value === filters.radius);
    return option ? option.label : '5 km';
  };

  return (
    <Card className="p-4 mb-6 bg-card border-border">
      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 sm:justify-between">
        <div className="flex flex-col sm:flex-row items-center gap-4 flex-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>

          {/* Nearby Shops Toggle */}
          <div className="flex items-center space-x-3 px-3 py-2 bg-muted/50 rounded-lg border border-border w-full sm:w-auto relative z-10">
            <Navigation className={`w-4 h-4 ${filters.nearMe ? 'text-primary' : 'text-muted-foreground'}`} />
            <div className="flex items-center space-x-2">
              <Switch
                id="nearby-mode"
                checked={filters.nearMe}
                onCheckedChange={handleNearbyToggle}
              />
              <Label
                htmlFor="nearby-mode"
                className="text-sm font-medium cursor-pointer"
              >
                Nearby Shops
              </Label>
            </div>
            {filters.nearMe && (
              <Badge variant="default" className="text-xs">
                {getCurrentRadiusLabel()}
              </Badge>
            )}
          </div>

          {onToggleMap && (
            <Button
              variant={showMap ? 'default' : 'outline'}
              size="sm"
              onClick={onToggleMap}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <MapPin className="w-4 h-4" />
              {showMap ? 'Hide Map' : 'Show Map'}
            </Button>
          )}

          <div className="relative w-full sm:flex-1 sm:max-w-md">
            <Input
              placeholder="Search services..."
              value={searchInput}
              onChange={handleSearchChange}
              className="pr-20"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
              {searchInput && (
                <button
                  onClick={handleClearSearch}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <Search className="w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>

        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="mt-2 sm:mt-0">
            Clear All
          </Button>
        )}
      </div>

      {/* Location Warning */}
      {!userLocation && filters.nearMe && (
        <div className="mt-3 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
          <p className="text-xs text-amber-800 dark:text-amber-200 flex items-center gap-2">
            <Navigation className="w-3 h-3" />
            Enable location access to use the Nearby Shops filter
          </p>
        </div>
      )}

      {isExpanded && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <h3 className="font-medium mb-3 text-card-foreground">Pet Types</h3>
            <div className="space-y-2">
              {petTypeOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`pet-${option.value}`}
                    checked={filters.petType.includes(option.value)}
                    onCheckedChange={(checked) =>
                      handlePetTypeChange(option.value, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={`pet-${option.value}`}
                    className="text-sm text-card-foreground cursor-pointer"
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3 text-card-foreground">Service Types</h3>
            <div className="space-y-2">
              {serviceTypeOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`service-${option.value}`}
                    checked={filters.serviceType.includes(option.value)}
                    onCheckedChange={(checked) =>
                      handleServiceTypeChange(option.value, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={`service-${option.value}`}
                    className="text-sm text-card-foreground cursor-pointer"
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3 text-card-foreground">Price Range</h3>
            <div className="px-2">
              <Slider
                value={filters.priceRange}
                onValueChange={handlePriceRangeChange}
                max={20000}
                step={5}
                className="mb-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>₹{filters.priceRange[0]}</span>
                <span>₹{filters.priceRange[1]}</span>
              </div>
            </div>

            <h3 className="font-medium mb-3 mt-4 text-card-foreground">Duration</h3>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Min Duration</label>
                <Select
                  value={filters.duration[0].toString()}
                  onValueChange={handleMinDurationChange}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Select min" />
                  </SelectTrigger>
                  <SelectContent>
                    {durationOptions.map((opt) => (
                      <SelectItem key={`min-${opt.value}`} value={opt.value.toString()}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Max Duration</label>
                <Select
                  value={filters.duration[1].toString()}
                  onValueChange={handleMaxDurationChange}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Select max" />
                  </SelectTrigger>
                  <SelectContent>
                    {durationOptions.map((opt) => (
                      <SelectItem key={`max-${opt.value}`} value={opt.value.toString()}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3 text-card-foreground">Minimum Rating</h3>
            <Select
              value={filters.rating.toString()}
              onValueChange={handleRatingChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any rating" />
              </SelectTrigger>
              <SelectContent>
                {ratingOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    <div className="flex flex-col">
                      <span className="font-medium">{option.label}</span>
                      <span className="text-xs text-muted-foreground">{option.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {filters.rating > 0 && (
              <div className="mt-2 p-2 bg-primary/10 rounded-md">
                <p className="text-xs text-primary font-medium">
                  Active: {getCurrentRatingLabel()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Filtering services with {filters.rating}+ average rating
                </p>
              </div>
            )}

            {/* Radius Selector - Only show when Nearby is enabled */}
            {filters.nearMe && (
              <>
                <h3 className="font-medium mb-3 mt-4 text-card-foreground">Search Radius</h3>
                <Select
                  value={filters.radius?.toString() || '5000'}
                  onValueChange={handleRadiusChange}
                  disabled={!userLocation}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select radius" />
                  </SelectTrigger>
                  <SelectContent>
                    {radiusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-2">
                  Search within {getCurrentRadiusLabel()} from your location
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};