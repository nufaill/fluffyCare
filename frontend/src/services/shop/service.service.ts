import shopaxios from "@/api/shop.axios";
import type { ServiceType, Service, CreateServiceData, UpdateServiceData, ServiceApiResponse, PetType } from "@/types/service.type";

export const serviceService = {
  async createService(shopId: string, serviceData: CreateServiceData): Promise<Service> {
    try {
      const response = await shopaxios.post<ServiceApiResponse>(`/service-create/${shopId}`, serviceData);
      return response.data.data as Service;
    } catch (error) {
      console.error('Error creating service:', error);
      throw error;
    }
  },

  async getServices(shopId: string): Promise<Service[]> {
    try {
      const response = await shopaxios.get<ServiceApiResponse>(`/service-list/${shopId}`);
      return response.data.data as Service[];
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  },

  async getServiceById(serviceId: string): Promise<Service> {
    try {
      const response = await shopaxios.get<ServiceApiResponse>(`/service/${serviceId}`);
      return response.data.data as Service;
    } catch (error) {
      console.error('Error fetching service:', error);
      throw error;
    }
  },

  async updateService(serviceId: string, updateData: UpdateServiceData): Promise<Service> {
    try {
      const response = await shopaxios.patch<ServiceApiResponse>(`/service/${serviceId}`, updateData);
      return response.data.data as Service;
    } catch (error) {
      console.error('Error updating service:', error);
      throw error;
    }
  },

  async toggleServiceStatus(serviceId: string): Promise<Service> {
    try {
      const response = await shopaxios.patch<ServiceApiResponse>(`/service/${serviceId}/toggle-status`);
      return response.data.data as Service;
    } catch (error) {
      console.error('Error toggling service status:', error);
      throw error;
    }
  },
  async getAllServiceTypes(): Promise<ServiceType[]> {
    const res = await shopaxios.get('/service-types');
    return res.data.data;
  },
  async getAllPetTypes(): Promise<PetType[]> {
    const res = await shopaxios.get('/pet-types');
    return res.data.data;
  }
};