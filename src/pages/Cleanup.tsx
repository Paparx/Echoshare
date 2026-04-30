import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Trash2, Plus, MapPin, AlertTriangle, Upload, X, Loader2, Info } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Cleanup = () => {
  const { cleanupPlaces, addCleanupPlace, updateCleanupStatus, deleteCleanupPlace, loading } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsEditing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(true);
    try {
      await addCleanupPlace({
        ...formData,
        imageUrl: imagePreview || undefined,
      });
      setShowModal(false);
      setFormData({ title: '', description: '', location: '' });
      setImagePreview(null);
      alert('Cleanup request posted! Neighbors have been alerted.');
    } catch (err) {
      alert('Failed to post cleanup request');
    } finally {
      setIsEditing(false);
    }
  };

  const handleOpenModal = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setShowModal(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Cleanup Needed</h1>
          <p className="text-gray-500 mt-1 font-medium">Help identify and clean up areas in our colony.</p>
        </div>
        <button 
          onClick={handleOpenModal}
          className="w-full md:w-auto bg-primary text-surface px-8 py-3.5 rounded-2xl font-black uppercase text-sm flex items-center justify-center space-x-2 hover:bg-primary/90 transition-all shadow-lg active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span>Report Place</span>
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {[1,2,3].map(i => <div key={i} className="h-64 bg-gray-50 animate-pulse rounded-[32px]"></div>)}
        </div>
      ) : cleanupPlaces.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[40px] border border-gray-100 mx-2">
          <div className="bg-surface w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Info className="w-8 h-8 text-secondary" />
          </div>
          <h3 className="text-xl font-black text-gray-900 uppercase">All clean!</h3>
          <p className="text-gray-400 font-medium mt-1">No cleanup requests currently active in the colony.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {[...cleanupPlaces].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).map((place) => {
            const isPoster = user?.id === place.postedBy;
            const isAdmin = user?.role === 'admin';

            return (
              <div key={place.id} className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all flex flex-col group">
                <div className="relative h-48 bg-gray-100">
                  {place.imageUrl ? (
                    <img src={place.imageUrl} alt={place.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <AlertTriangle className="w-12 h-12" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm",
                      place.status === 'pending' ? "bg-amber-100 text-amber-700" :
                      place.status === 'cleaning' ? "bg-blue-100 text-blue-700" :
                      "bg-emerald-100 text-emerald-700"
                    )}>
                      {place.status}
                    </span>
                  </div>
                  {(isPoster || isAdmin) && (
                    <div className="absolute top-4 right-4">
                      <button 
                        onClick={() => deleteCleanupPlace(place.id)}
                        className="p-2 bg-white/90 backdrop-blur-sm text-red-500 rounded-xl shadow-sm hover:bg-red-500 hover:text-white transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">{place.title}</h3>
                    <div className="flex items-center gap-1.5 text-gray-500 text-xs font-medium mt-1">
                      <MapPin className="w-3.5 h-3.5 text-secondary" />
                      <span>{place.location}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1">{place.description}</p>
                  
                  <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Reported By</span>
                      <span className="text-sm font-bold text-gray-700">{place.posterName}</span>
                    </div>
                    {place.status !== 'completed' && user?.role === 'admin' && (
                      <button
                        onClick={() => updateCleanupStatus(place.id, place.status === 'pending' ? 'cleaning' : 'completed')}
                        className="bg-secondary text-surface px-4 py-2 rounded-xl text-xs font-bold hover:bg-secondary/90 transition-all flex items-center gap-1.5 shadow-md shadow-secondary/10"
                      >
                        {place.status === 'pending' ? 'Start Cleaning' : 'Mark Done'}
                      </button>
                    )}
                    {place.status !== 'completed' && user?.role !== 'admin' && (
                      <span className="text-[10px] font-bold text-gray-400 italic">Admin verification pending</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary/20 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[40px] p-8 shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-black text-gray-900 leading-none">Report Cleanup</h2>
                <p className="text-gray-500 text-sm mt-2">Alert all residents about a dirty area.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Area Title</label>
                <input
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary outline-none"
                  placeholder="e.g., Spill in Elevator B"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Specific Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    required
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary outline-none"
                    placeholder="e.g., Building 4, 3rd Floor"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Description</label>
                <textarea
                  required
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary outline-none resize-none"
                  placeholder="What needs to be cleaned? Is it urgent?"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Upload Photo (Optional)</label>
                {imagePreview ? (
                  <div className="relative rounded-2xl overflow-hidden aspect-video border-2 border-accent">
                    <img src={imagePreview} className="w-full h-full object-cover" />
                    <button onClick={() => setImagePreview(null)} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"><X className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-surface/30 transition-all group">
                    <Upload className="w-8 h-8 text-gray-400 group-hover:text-primary transition-colors" />
                    <p className="text-xs font-bold text-gray-500 mt-2">Click to add a photo</p>
                  </div>
                )}
                <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-surface py-4 rounded-2xl font-black text-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-primary/20"
              >
                {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Report & Alert Neighbors</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cleanup;
