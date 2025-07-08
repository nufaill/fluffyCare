import { useState } from 'react';
import type { FilterOptions } from '@/types/service';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, SlidersHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface FilterBarProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onToggleMap?: () => void;
  showMap?: boolean;
}

const petTypeOptions = [
  { value: 'dog', label: 'Dogs' },
  { value: 'cat', label: 'Cats' },
  { value: 'bird', label: 'Birds' },
  { value: 'rabbit', label: 'Rabbits' },
  { value: 'other', label: 'Other' },
];

const serviceTypeOptions = [
  { value: 'grooming', label: 'Grooming' },
  { value: 'walking', label: 'Walking' },
  { value: 'veterinary', label: 'Veterinary' },
  { value: 'boarding', label: 'Boarding' },
  { value: 'training', label: 'Training' },
];

export const FilterBar = ({ filters, onFiltersChange, onToggleMap, showMap }: FilterBarProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handlePetTypeChange = (petType: string, checked: boolean) => {
    const newPetTypes = checked 
      ? [...filters.petType, petType]
      : filters.petType.filter(type => type !== petType);
    
    onFiltersChange({ ...filters, petType: newPetTypes });
  };

  const handleServiceTypeChange = (serviceType: string, checked: boolean) => {
    const newServiceTypes = checked
      ? [...filters.serviceType, serviceType]
      : filters.serviceType.filter(type => type !== serviceType);
    
    onFiltersChange({ ...filters, serviceType: newServiceTypes });
  };

  const handlePriceRangeChange = (value: number[]) => {
    onFiltersChange({ ...filters, priceRange: [value[0], value[1]] });
  };

  const handleDurationChange = (value: number[]) => {
    onFiltersChange({ ...filters, duration: [value[0], value[1]] });
  };

  const handleRatingChange = (rating: string) => {
    onFiltersChange({ ...filters, rating: parseInt(rating) });
  };

  const handleNearMeToggle = () => {
    onFiltersChange({ ...filters, nearMe: !filters.nearMe });
  };

  const clearFilters = () => {
    onFiltersChange({
      petType: [],
      serviceType: [],
      priceRange: [0, 200],
      duration: [0, 24],
      rating: 0,
      nearMe: false,
    });
  };

  const activeFiltersCount = 
    filters.petType.length + 
    filters.serviceType.length + 
    (filters.rating > 0 ? 1 : 0) + 
    (filters.nearMe ? 1 : 0);

  return (
    <Card className="p-4 mb-6 bg-card border-border">
      <div className="flex flex-wrap items-center gap-4 justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>

          {onToggleMap && (
            <Button
              variant={showMap ? "default" : "outline"}
              size="sm"
              onClick={onToggleMap}
              className="flex items-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              {showMap ? 'Hide Map' : 'Show Map'}
            </Button>
          )}
        </div>

        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear All
          </Button>
        )}
      </div>

      {isExpanded && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pet Types */}
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

          {/* Service Types */}
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

          {/* Price Range & Duration */}
          <div>
            <h3 className="font-medium mb-3 text-card-foreground">Price Range</h3>
            <div className="px-2">
              <Slider
                value={filters.priceRange}
                onValueChange={handlePriceRangeChange}
                max={200}
                step={5}
                className="mb-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>${filters.priceRange[0]}</span>
                <span>${filters.priceRange[1]}</span>
              </div>
            </div>

            <h3 className="font-medium mb-3 mt-4 text-card-foreground">Duration (hours)</h3>
            <div className="px-2">
              <Slider
                value={filters.duration}
                onValueChange={handleDurationChange}
                max={24}
                step={1}
                className="mb-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{filters.duration[0]}h</span>
                <span>{filters.duration[1]}h</span>
              </div>
            </div>
          </div>

          {/* Rating & Near Me */}
          <div>
            <h3 className="font-medium mb-3 text-card-foreground">Minimum Rating</h3>
            <Select value={filters.rating.toString()} onValueChange={handleRatingChange}>
              <SelectTrigger>
                <SelectValue placeholder="Any rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Any rating</SelectItem>
                <SelectItem value="3">3+ stars</SelectItem>
                <SelectItem value="4">4+ stars</SelectItem>
                <SelectItem value="4.5">4.5+ stars</SelectItem>
              </SelectContent>
            </Select>

            <div className="mt-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="near-me"
                  checked={filters.nearMe}
                  onCheckedChange={handleNearMeToggle}
                />
                <label 
                  htmlFor="near-me"
                  className="text-sm text-card-foreground cursor-pointer"
                >
                  Near Me
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};