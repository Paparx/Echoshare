import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Calendar, MapPin, Users, Plus, ChevronRight, Upload, X, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Events = () => {
  const { events, joinEvent, createEvent, loading } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
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
    setIsSubmitting(true);
    try {
      await createEvent({
        ...formData,
        imageUrl: imagePreview || undefined
      });
      setShowModal(false);
      setFormData({ title: '', description: '', date: '', location: '' });
      setImagePreview(null);
    } catch (err) {
      alert('Failed to create event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoin = async (id: string) => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await joinEvent(id);
    } catch (err) {
      alert('Failed to join event');
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
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Community Events</h1>
          <p className="text-gray-500 mt-1 font-medium">Connect with your neighbors and grow together.</p>
        </div>
        <button 
          onClick={handleOpenModal}
          className="w-full md:w-auto bg-primary text-surface px-8 py-3.5 rounded-2xl font-black uppercase text-sm flex items-center justify-center space-x-2 hover:bg-primary/90 transition-all shadow-lg active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span>Organize Event</span>
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          {[1,2].map(i => <div key={i} className="h-64 bg-gray-50 animate-pulse rounded-[32px]"></div>)}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[40px] border border-gray-100 mx-2">
          <div className="bg-surface w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Calendar className="w-8 h-8 text-secondary" />
          </div>
          <h3 className="text-xl font-black text-gray-900 uppercase">No upcoming events</h3>
          <p className="text-gray-400 font-medium mt-1">Be the first to organize a community meetup!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          {[...events].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).map((event) => {
            const isParticipant = user && event.participants.includes(user.id);

            return (
              <div key={event.id} className="relative overflow-hidden bg-white rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all group min-h-[280px] flex flex-col">
                {/* Background Image */}
                {event.imageUrl && (
                  <div className="absolute inset-0 z-0">
                    <img src={event.imageUrl} className="w-full h-full object-cover" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-gray-900/20"></div>
                  </div>
                )}

                <div className={cn(
                  "relative z-10 p-8 flex-1 flex flex-col",
                  event.imageUrl ? "text-white" : "text-gray-900"
                )}>
                  <div className="flex justify-between items-start mb-6">
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 flex flex-col items-center justify-center min-w-[80px] shadow-lg border border-accent/20">
                      <span className="text-primary font-black text-2xl leading-none">{format(new Date(event.date), 'dd')}</span>
                      <span className="text-secondary font-black uppercase text-[10px] tracking-widest mt-1">{format(new Date(event.date), 'MMM')}</span>
                    </div>
                  </div>

                  <div className="mt-auto space-y-4">
                    <div>
                      <h3 className="text-2xl font-black leading-tight mb-2">{event.title}</h3>
                      <p className={cn(
                        "text-sm line-clamp-2 leading-relaxed",
                        event.imageUrl ? "text-gray-200" : "text-gray-500"
                      )}>{event.description}</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-xs font-black uppercase tracking-wider">
                      <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-accent" /><span>{event.location}</span></div>
                      <div className="flex items-center gap-1.5"><Users className="w-4 h-4 text-accent" /><span>{event.participants.length} joined</span></div>
                    </div>

                    <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-tighter italic",
                        event.imageUrl ? "text-white/60" : "text-gray-400"
                      )}>By {event.creatorName}</span>
                      
                      {isParticipant ? (
                        <span className="flex items-center gap-1 bg-accent text-primary px-4 py-2 rounded-xl text-xs font-black">
                          <ChevronRight className="w-4 h-4" /> YOU'RE GOING
                        </span>
                      ) : (
                        <button 
                          onClick={() => handleJoin(event.id)}
                          className="bg-primary text-surface px-6 py-2.5 rounded-xl text-xs font-black hover:scale-105 transition-all shadow-lg"
                        >
                          JOIN EVENT
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/20 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Organize Event</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Event Title</label>
                <input
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Garden Clean-up Drive"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date & Time</label>
                  <input
                    required
                    type="datetime-local"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    onClick={(e) => (e.target as any).showPicker?.()}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Location</label>
                  <input
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Central Park"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                <textarea
                  required
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Tell people what the event is about..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Event Image (Background)</label>
                {imagePreview ? (
                  <div className="relative rounded-2xl overflow-hidden aspect-video border-2 border-accent">
                    <img src={imagePreview} className="w-full h-full object-cover" alt="" />
                    <button type="button" onClick={() => setImagePreview(null)} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"><X className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-surface/30 transition-all group">
                    <Upload className="w-8 h-8 text-gray-400 group-hover:text-primary transition-colors" />
                    <p className="text-xs font-bold text-gray-500 mt-2">Add a background image</p>
                  </div>
                )}
                <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-primary text-surface px-6 py-3 rounded-2xl font-black hover:bg-primary/90 transition-all shadow-lg shadow-primary/10 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Create Event</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;
