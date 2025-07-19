

import React, { useState } from 'react';
import { Camera, Plus, ArrowLeft, Tag, Shirt } from 'lucide-react';
import { Service } from './Types/Servicee';
import { apiFetch } from '../utilss/apifetch';

interface ServiceFormProps {
  onSubmit: (service: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onBack: () => void;
}

const categories = [
  { value: 'Shirt', label: 'Shirt', icon: '👔' },
  { value: 'Pant', label: 'Pant', icon: '👖' },
  { value: 'Bedsheet', label: 'Bedsheet', icon: '🛏️' },
  { value: 'Curtain', label: 'Curtain', icon: '🪟' },
];

const serviceTypes = [
  { value: 'wash', label: 'wash', icon: '🧼' },
  { value: 'dry-clean', label: 'dry-clean', icon: '🧽' },
  { value: 'iron', label: 'iron', icon: '🔥' },
];

export default function ServiceForm({ onSubmit, onBack }: ServiceFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    name: '',
    category: '',
    serviceType: '',
    price: '',
    description: '',
  });

  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.title.trim() ||
      // !formData.name.trim() ||
      !formData.category ||
      !formData.serviceType ||
      !formData.price ||
      // !formData.description.trim() ||
      !photo
    )
      return alert('Please fill all required fields and upload a photo.');

    try {
      setIsSubmitting(true);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('User not logged in. Token missing.');
      }

      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => data.append(key, value));
      data.append('image', photo);

      const res = await apiFetch('/api/product/create', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      if (!res.ok) {
        let msg = 'Upload failed';
        try {
          const error = await res.json();
          msg = error.message || msg;
        } catch {
          const fallback = await res.text();
          msg = fallback || msg;
        }
        throw new Error(msg);
      }

alert('Service created successfully!');
setFormData({
  title: '',
  name: '',
  category: '',
  serviceType: '',
  price: '',
  description: '',
});
setPhoto(null);
setPreview(null);

const result = await res.json();
onSubmit({
  _id: result._id,
  title: formData.title,
  name: formData.name,
  category: formData.category,
  serviceType: formData.serviceType,
  price: parseFloat(formData.price),
  description: formData.description,
  image: result.imageUrl,
});

    } catch (err: any) {
      console.error('Upload error:', err);
      alert(err.message || 'Upload failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    formData.title.trim() &&
    // formData.name.trim() &&
    formData.category &&
    formData.serviceType &&
    formData.price &&
    // formData.description.trim() &&
    photo;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors duration-200 group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
              Back to Services
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-teal-600 px-8 py-6">
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <Plus className="w-6 h-6" />
                Add New Service
              </h1>
              <p className="text-blue-100 mt-2">Fill in the details to add a new washing service</p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <label htmlFor="title" className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Service Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg"
                  placeholder="e.g., Premium Shirt Washing Service"
                  required
                />
              </div>

              {/* Name */}
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Shirt className="w-4 h-4" />
                  Service Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg"
                  placeholder="e.g., Express Wash & Fold"
                 
                />
              </div>

              {/* Category and Service Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="category" className="block text-sm font-semibold text-gray-700">Category *</label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.icon} {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="serviceType" className="block text-sm font-semibold text-gray-700">Service Type *</label>
                  <select
                    id="serviceType"
                    value={formData.serviceType}
                    onChange={(e) => setFormData(prev => ({ ...prev, serviceType: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                    required
                  >
                    <option value="">Select Service Type</option>
                    {serviceTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <label htmlFor="price" className="block text-sm font-semibold text-gray-700">Price (₹) *</label>
               <input
               type="number"
               id="price"
               value={formData.price}
               onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
               onWheel={(e) => e.currentTarget.blur()}
               onKeyDown={(e) => {
             if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                 e.preventDefault();
                }
          }}
                 className="w-full px-4 py-3 border border-gray-300 rounded-xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                 placeholder="Amount"
                 required
                />
              </div>

              {/* Photo Upload */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Camera className="w-4 h-4" /> Service Photo *
                </label>
                <div className="relative">
                  <input type="file" id="photo" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                  <label
                    htmlFor="photo"
                    className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 transition-colors duration-200 bg-gray-50 hover:bg-blue-50"
                  >
                    {preview ? (
                      <div className="relative w-full h-full">
                        <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-200">
                          <Camera className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 font-medium">Click to upload a photo</p>
                        <p className="text-gray-400 text-sm mt-1">PNG, JPG up to 10MB</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-semibold text-gray-700">Service Description *</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                  placeholder="Describe your service in detail..."
                
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting || !isFormValid}
                  className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-teal-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Adding Service...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      <Plus className="w-5 h-5" />
                      Add Service
                    </div>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

