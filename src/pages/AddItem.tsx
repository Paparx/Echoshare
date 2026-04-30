import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Package, Upload, ArrowLeft, Loader2, X } from 'lucide-react';
import { ItemCategory, ItemType } from '../types';

const AddItem = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Tools' as ItemCategory,
    type: 'lend' as ItemType,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addItem } = useData();
  const navigate = useNavigate();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size too large (max 2MB)');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addItem({
        ...formData,
        imageUrl: imagePreview || undefined
      });
      navigate('/items');
    } catch (err) {
      alert('Failed to add item');
    } finally {
      setLoading(false);
    }
  };

  const categories: ItemCategory[] = ['Tools', 'Books', 'Electronics', 'Kitchenware', 'Sports', 'Other'];
  const types: ItemType[] = ['lend', 'donate', 'rent'];

  return (
    <div className="max-w-2xl mx-auto">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-gray-500 hover:text-primary transition-colors mb-6 group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">Back to Items</span>
      </button>

      <div className="bg-white rounded-3xl shadow-xl shadow-primary/5 border border-gray-100 p-8">
        <div className="flex items-center space-x-4 mb-8">
          <div className="bg-accent/20 p-3 rounded-2xl">
            <Package className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Post a New Item</h1>
            <p className="text-gray-500">Contribute to your community's resource pool.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Title</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary transition-all"
                placeholder="e.g., Cordless Drill"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Category</label>
              <select
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary appearance-none font-medium text-gray-700"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as ItemCategory })}
              >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Type</label>
              <select
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary appearance-none font-medium text-gray-700"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as ItemType })}
              >
                {types.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Description</label>
            <textarea
              required
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary transition-all resize-none"
              placeholder="Describe your item, its condition, and any special instructions..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Item Image</label>
            {imagePreview ? (
              <div className="relative group rounded-2xl overflow-hidden border-2 border-accent aspect-video">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center space-y-2 cursor-pointer hover:border-primary hover:bg-surface/30 transition-all"
              >
                <Upload className="w-8 h-8 text-gray-400" />
                <p className="text-sm font-medium text-gray-500">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-400 uppercase font-bold tracking-tighter">PNG, JPG up to 2MB</p>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-surface py-4 rounded-2xl font-bold hover:bg-primary/90 transition-all flex justify-center items-center space-x-2 disabled:opacity-70 shadow-lg shadow-primary/10 mt-4"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <span>Post Item</span>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddItem;
