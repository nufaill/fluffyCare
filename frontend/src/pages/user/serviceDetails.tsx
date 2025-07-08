// import { useParams, useNavigate } from 'react-router-dom';
// import  Header  from '@/components/user/Header';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent } from '@/components/ui/card';
// import { Badge } from '@/components/ui/Badge';
// import { Separator } from '@/components/ui/separator';
// import { mockServices, mockReviews } from '@/hooks/mockData';
// import { ArrowLeft, MapPin, Phone, Mail, Globe, Clock, Star } from 'lucide-react';
// import type { Key, ReactElement, JSXElementConstructor, ReactNode, ReactPortal } from 'react';

// export const ServiceDetails = () => {
//   const { id } = useParams<{ id: string }>();
//   const navigate = useNavigate();
  
//   const service = mockServices.find((s: { id: string | undefined; }) => s.id === id);
//   const reviews = mockReviews[id || ''] || [];

//   if (!service) {
//     return (
//       <div className="min-h-screen bg-background">
//         <Header />
//         <div className="container mx-auto px-4 py-8 text-center">
//           <h1 className="text-2xl font-bold text-foreground mb-4">Service Not Found</h1>
//           <Button onClick={() => navigate('/')}>
//             Back to Services
//           </Button>
//         </div>
//       </div>
//     );
//   }

//   const formatPetTypes = (petTypes: string[]) => {
//     return petTypes.map(type => type.charAt(0).toUpperCase() + type.slice(1)).join(', ');
//   };

//   const renderStars = (rating: number) => {
//     return Array.from({ length: 5 }, (_, i) => (
//       <Star
//         key={i}
//         className={`w-4 h-4 ${
//           i < Math.floor(rating) ? 'fill-current text-yellow-400' : 'text-gray-300'
//         }`}
//       />
//     ));
//   };

//   return (
//     <div className="min-h-screen bg-background">
//       <Header />
      
//       <main className="container mx-auto px-4 py-8">
//         <Button
//           variant="ghost"
//           onClick={() => navigate('/')}
//           className="mb-6 flex items-center gap-2"
//         >
//           <ArrowLeft className="w-4 h-4" />
//           Back to Services
//         </Button>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Main Content */}
//           <div className="lg:col-span-2 space-y-6">
//             {/* Service Image */}
//             <div className="relative rounded-lg overflow-hidden">
//               <img
//                 src={service.serviceImage}
//                 alt={service.serviceName}
//                 className="w-full h-64 md:h-80 object-cover"
//               />
//               <div className="absolute top-4 right-4">
//                 <Badge className="bg-background/90 backdrop-blur-sm text-foreground">
//                   ${service.price}
//                 </Badge>
//               </div>
//             </div>

//             {/* Service Info */}
//             <Card>
//               <CardContent className="p-6">
//                 <div className="flex items-start gap-4 mb-4">
//                   <img
//                     src={service.shopLogo}
//                     alt={`${service.shopName} logo`}
//                     className="w-16 h-16 rounded-full object-cover border border-border"
//                   />
//                   <div className="flex-1">
//                     <h1 className="text-2xl font-bold text-card-foreground mb-1">
//                       {service.serviceName}
//                     </h1>
//                     <p className="text-lg text-muted-foreground mb-2">
//                       {service.shopName}
//                     </p>
//                     <div className="flex items-center gap-4">
//                       <div className="flex items-center gap-1">
//                         {renderStars(service.rating)}
//                         <span className="ml-1 text-sm text-muted-foreground">
//                           {service.rating} ({service.reviewCount} reviews)
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
//                   <div>
//                     <p className="text-sm text-muted-foreground">Service Type</p>
//                     <p className="font-medium text-card-foreground capitalize">
//                       {service.serviceType}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-muted-foreground">Duration</p>
//                     <p className="font-medium text-card-foreground">
//                       {service.duration} {service.duration === 1 ? 'hour' : 'hours'}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-muted-foreground">Pet Types</p>
//                     <p className="font-medium text-card-foreground">
//                       {formatPetTypes(service.petTypes)}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-muted-foreground">Price</p>
//                     <p className="font-medium text-card-foreground">
//                       ${service.price}
//                     </p>
//                   </div>
//                 </div>

//                 <Separator className="my-4" />

//                 <div>
//                   <h3 className="font-semibold text-card-foreground mb-2">Description</h3>
//                   <p className="text-muted-foreground">
//                     {service.shopDetails.description}
//                   </p>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Reviews */}
//             <Card>
//               <CardContent className="p-6">
//                 <h3 className="font-semibold text-card-foreground mb-4">
//                   Reviews ({reviews.length})
//                 </h3>
                
//                 {reviews.length > 0 ? (
//                   <div className="space-y-4 max-h-96 overflow-y-auto">
//                     {reviews.map((review: { id: Key | null | undefined; userAvatar: string | undefined; userName: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; rating: number; date: string | number | Date; comment: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; }) => (
//                       <div key={review.id} className="flex gap-3 p-4 bg-muted/50 rounded-lg">
//                         <img
//                           src={review.userAvatar}
//                           className="w-10 h-10 rounded-full object-cover"
//                         />
//                         <div className="flex-1">
//                           <div className="flex items-center gap-2 mb-1">
//                             <span className="font-medium text-card-foreground">
//                               {review.userName}
//                             </span>
//                             <div className="flex items-center">
//                               {renderStars(review.rating)}
//                             </div>
//                             <span className="text-sm text-muted-foreground">
//                               {new Date(review.date).toLocaleDateString()}
//                             </span>
//                           </div>
//                           <p className="text-muted-foreground text-sm">
//                             {review.comment}
//                           </p>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <p className="text-muted-foreground text-center py-8">
//                     No reviews yet. Be the first to leave a review!
//                   </p>
//                 )}
//               </CardContent>
//             </Card>
//           </div>

//           {/* Sidebar */}
//           <div className="space-y-6">
//             {/* Shop Details */}
//             <Card>
//               <CardContent className="p-6">
//                 <h3 className="font-semibold text-card-foreground mb-4">Shop Details</h3>
                
//                 <div className="space-y-3">
//                   <div className="flex items-start gap-3">
//                     <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
//                     <div>
//                       <p className="text-card-foreground">{service.location.address}</p>
//                       <p className="text-muted-foreground text-sm">
//                         {service.location.city}, {service.location.state} {service.location.zipCode}
//                       </p>
//                     </div>
//                   </div>
                  
//                   <div className="flex items-center gap-3">
//                     <Phone className="w-5 h-5 text-muted-foreground" />
//                     <a 
//                       href={`tel:${service.shopDetails.phone}`}
//                       className="text-card-foreground hover:text-primary"
//                     >
//                       {service.shopDetails.phone}
//                     </a>
//                   </div>
                  
//                   <div className="flex items-center gap-3">
//                     <Mail className="w-5 h-5 text-muted-foreground" />
//                     <a 
//                       href={`mailto:${service.shopDetails.email}`}
//                       className="text-card-foreground hover:text-primary"
//                     >
//                       {service.shopDetails.email}
//                     </a>
//                   </div>
                  
//                   {service.shopDetails.website && (
//                     <div className="flex items-center gap-3">
//                       <Globe className="w-5 h-5 text-muted-foreground" />
//                       <a 
//                         href={`https://${service.shopDetails.website}`}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="text-card-foreground hover:text-primary"
//                       >
//                         {service.shopDetails.website}
//                       </a>
//                     </div>
//                   )}
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Hours */}
//             <Card>
//               <CardContent className="p-6">
//                 <h3 className="font-semibold text-card-foreground mb-4 flex items-center gap-2">
//                   <Clock className="w-5 h-5" />
//                   Hours
//                 </h3>
                
//                 <div className="space-y-2">
//                   {Object.entries(service.shopDetails.hours).map(([day, hours]) => (
//                     <div key={day} className="flex justify-between">
//                       <span className="text-muted-foreground">{day}</span>
//                       <span className="text-card-foreground">{hours}</span>
//                     </div>
//                   ))}
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Map Placeholder */}
//             <Card>
//               <CardContent className="p-6">
//                 <h3 className="font-semibold text-card-foreground mb-4">Location</h3>
//                 <div className="bg-muted rounded-lg h-40 flex items-center justify-center">
//                   <div className="text-center">
//                     <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
//                     <p className="text-sm text-muted-foreground">
//                       Interactive map would show here
//                     </p>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// };