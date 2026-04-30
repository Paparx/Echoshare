import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Award, Package, Calendar, Building, Mail, User as UserIcon, Trash2, Edit, X, Camera, MapPin, Clock, Shield, AlertTriangle, CheckCircle2, XCircle, Save, Upload, Users } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Item, ItemCategory, ItemType, CommunityEvent, User } from '../types';
import { format } from 'date-fns';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { items, events, cleanupPlaces, deleteItem, updateItem, deleteEvent, updateEvent, deleteCleanupPlace, updateCleanupStatus, refreshData } = useData();
  
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [editingEvent, setEditingEvent] = useState<CommunityEvent | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileFormData, setProfileFormData] = useState<Partial<User>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const itemFileRef = useRef<HTMLInputElement>(null);
  const eventFileRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  // Sort items/events/posts by updated date (descending)
  const userItems = items
    .filter(i => i.ownerId === user.id)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const myEvents = events
    .filter(e => e.createdBy === user.id)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const joinedEvents = events
    .filter(e => e.participants.includes(user.id) && e.createdBy !== user.id)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const myCleanupPosts = cleanupPlaces
    .filter(p => p.postedBy === user.id)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const handleDeleteItem = async (id: string) => {
    if (window.confirm('Delete this item?')) {
      await deleteItem(id);
    }
  };

  const handleToggleAvailability = async (itemId: string, currentStatus: boolean) => {
    try {
      await updateItem(itemId, { available: !currentStatus });
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    try {
      await updateItem(editingItem.id, editingItem);
      setEditingItem(null);
    } catch (err) {
      alert('Failed to update item');
    }
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;
    try {
      await updateEvent(editingEvent.id, editingEvent);
      setEditingEvent(null);
    } catch (err) {
      alert('Failed to update event');
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (window.confirm('Delete this event?')) {
      await deleteEvent(id);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(profileFormData);
      await refreshData();
      setIsEditingProfile(false);
    } catch (err) {
      alert('Failed to update profile');
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateProfile({ avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const openProfileEdit = () => {
    setProfileFormData({
      name: user.name,
      email: user.email,
      flatNumber: user.flatNumber
    });
    setIsEditingProfile(true);
  };

  const categories: ItemCategory[] = ['Tools', 'Books', 'Electronics', 'Kitchenware', 'Sports', 'Other'];
  const types: ItemType[] = ['lend', 'donate', 'rent'];

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-24 md:pb-12 px-2">
      {/* Profile Header */}
      <div className="bg-white rounded-[40px] p-6 md:p-12 shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full -translate-y-1/2 translate-x-1/2 -z-0"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="relative group shrink-0">
            <div className="w-32 h-32 bg-accent/20 rounded-[32px] flex items-center justify-center border-4 border-white shadow-xl overflow-hidden">
              {user.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" /> : <UserIcon className="w-16 h-16 text-primary" />}
            </div>
            <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 p-2 bg-primary text-surface rounded-xl shadow-lg border-2 border-white transition-transform active:scale-95"><Camera className="w-4 h-4" /></button>
            <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
          </div>
          <div className="text-center md:text-left flex-1 space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <h1 className="text-3xl md:text-4xl font-black text-gray-900">{user.name}</h1>
              {user.role === 'admin' && <span className="bg-primary text-surface text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">Admin</span>}
              <button onClick={openProfileEdit} className="p-2 text-gray-400 hover:text-primary transition-colors"><Edit className="w-5 h-5" /></button>
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-gray-500 font-medium">
              <div className="flex items-center gap-1.5"><Building className="w-4 h-4 text-secondary" /><span>Flat {user.flatNumber}</span></div>
              <div className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-secondary" /><span>{user.email}</span></div>
              <div className="flex items-center gap-1.5 font-black text-primary bg-accent/20 px-3 py-0.5 rounded-lg"><span>{user.points || 0} Pts</span></div>
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-4">
              {user.badges.map(badge => <span key={badge} className="bg-amber-50 text-amber-600 border border-amber-100 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-sm"><Award className="w-4 h-4" />{badge}</span>)}
            </div>
          </div>
        </div>
      </div>

      {/* Items Section */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2 px-2"><Package className="w-6 h-6 text-secondary" /> My Posted Items</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {userItems.length === 0 ? (
            <div className="col-span-full bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-100">
               <Package className="w-12 h-12 text-gray-200 mx-auto mb-4" />
               <p className="text-gray-500">You haven't posted any items yet.</p>
            </div>
          ) : (
            userItems.map(item => (
              <div key={item.id} className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm flex flex-col group hover:shadow-xl transition-all">
                <div className="relative h-48 bg-gray-50">
                  {item.imageUrl ? <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><Package className="w-12 h-12" /></div>}
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setEditingItem(item)} className="p-2 bg-white/95 text-primary rounded-xl shadow-md"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteItem(item.id)} className="p-2 bg-white/95 text-red-500 rounded-xl shadow-md"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h4 className="font-bold text-gray-900 text-lg mb-2 line-clamp-1">{item.title}</h4>
                  <button onClick={() => handleToggleAvailability(item.id, item.available)} className={cn("w-full mt-auto py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm", item.available ? "bg-amber-50 text-amber-600 hover:bg-amber-100" : "bg-primary text-surface hover:bg-primary/90")}>
                    {item.available ? 'Mark Borrowed' : 'Mark Available'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Organized Events Section */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2 px-2"><Calendar className="w-6 h-6 text-primary" /> My Organized Events</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {myEvents.length === 0 ? (
            <div className="col-span-full bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-100">
               <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-4" />
               <p className="text-gray-500">You haven't organized any events yet.</p>
            </div>
          ) : (
            myEvents.map(event => (
              <div key={event.id} className="relative overflow-hidden bg-white rounded-[32px] border border-gray-100 shadow-sm flex flex-col group hover:shadow-xl transition-all min-h-[200px]">
                {event.imageUrl && (
                  <div className="absolute inset-0 z-0">
                    <img src={event.imageUrl} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent"></div>
                  </div>
                )}
                <div className={cn("relative z-10 p-6 flex-1 flex flex-col", event.imageUrl ? "text-white" : "text-gray-900")}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-3 flex flex-col items-center justify-center min-w-[60px] shadow-lg border border-accent/20">
                      <span className="text-primary font-black text-xl leading-none">{format(new Date(event.date), 'dd')}</span>
                      <span className="text-secondary font-black uppercase text-[8px] tracking-widest mt-0.5">{format(new Date(event.date), 'MMM')}</span>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setEditingEvent(event)} className="p-2 bg-white/95 text-primary rounded-xl shadow-md"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteEvent(event.id)} className="p-2 bg-white/95 text-red-500 rounded-xl shadow-md"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <h4 className="font-bold text-lg leading-tight mb-2">{event.title}</h4>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Cleanup Reports Section */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2 px-2"><Shield className="w-6 h-6 text-primary" /> My Cleanup Reports</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {myCleanupPosts.length === 0 ? (
            <div className="col-span-full bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-100">
               <Shield className="w-12 h-12 text-gray-200 mx-auto mb-4" />
               <p className="text-gray-500">You haven't reported any cleanup areas yet.</p>
            </div>
          ) : (
            myCleanupPosts.map(place => (
              <div key={place.id} className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm group hover:shadow-xl transition-all">
                <div className="relative h-40 bg-gray-50">
                  {place.imageUrl ? <img src={place.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><MapPin className="w-8 h-8" /></div>}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => deleteCleanupPlace(place.id)} className="p-2 bg-white/95 text-red-500 rounded-xl shadow-md"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className="bg-surface/90 backdrop-blur-sm text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm">{place.status}</span>
                  </div>
                </div>
                <div className="p-6">
                  <h4 className="font-bold text-gray-900 mb-4 line-clamp-1">{place.title}</h4>
                  {user.role === 'admin' ? (
                    <button onClick={() => updateCleanupStatus(place.id, place.status === 'pending' ? 'cleaning' : 'completed')} disabled={place.status === 'completed'} className={cn("w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all", place.status === 'completed' ? "bg-gray-100 text-gray-400" : "bg-secondary text-surface hover:bg-secondary/90")}>
                      {place.status === 'pending' ? 'Start Cleaning' : place.status === 'cleaning' ? 'Mark Done' : 'Verified'}
                    </button>
                  ) : (
                    <div className="bg-gray-50 py-2 rounded-xl text-center"><span className="text-[10px] font-black uppercase text-gray-400">Admin Verify Only</span></div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Joined Events Section */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2 px-2"><Users className="w-6 h-6 text-secondary" /> Joined Community Events</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {joinedEvents.length === 0 ? (
            <div className="col-span-full bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-100">
               <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-4" />
               <p className="text-gray-500">You haven't joined any events yet.</p>
            </div>
          ) : (
            joinedEvents.map(event => (
              <div key={event.id} className="relative overflow-hidden bg-white rounded-[32px] border border-gray-100 shadow-sm flex flex-col group hover:shadow-xl transition-all min-h-[180px]">
                {event.imageUrl && (
                  <div className="absolute inset-0 z-0">
                    <img src={event.imageUrl} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent"></div>
                  </div>
                )}
                <div className={cn("relative z-10 p-6 flex-1 flex flex-col", event.imageUrl ? "text-white" : "text-gray-900")}>
                  <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-2.5 flex flex-col items-center justify-center w-[50px] shadow-lg border border-accent/20 mb-4">
                    <span className="text-primary font-black text-lg leading-none">{format(new Date(event.date), 'dd')}</span>
                    <span className="text-secondary font-black uppercase text-[7px] tracking-widest mt-0.5">{format(new Date(event.date), 'MMM')}</span>
                  </div>
                  <h4 className="font-bold text-base leading-tight mb-2">{event.title}</h4>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase opacity-60">By {event.creatorName}</span>
                    <span className="bg-accent text-primary px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">Going</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Edit Modals */}
      {editingItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary/30 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[32px] p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-black">Edit Item</h2><button onClick={() => setEditingItem(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-6 h-6 text-gray-400" /></button></div>
            <form onSubmit={handleUpdateItem} className="space-y-4">
              <input className="w-full px-4 py-3 bg-gray-50 rounded-2xl outline-none" value={editingItem.title} onChange={(e) => setEditingItem({...editingItem, title: e.target.value})} placeholder="Title" />
              <div className="grid grid-cols-2 gap-4">
                <select className="w-full px-4 py-3 bg-gray-50 rounded-2xl" value={editingItem.category} onChange={(e) => setEditingItem({...editingItem, category: e.target.value as ItemCategory})}>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select>
                <select className="w-full px-4 py-3 bg-gray-50 rounded-2xl" value={editingItem.type} onChange={(e) => setEditingItem({...editingItem, type: e.target.value as ItemType})}>{types.map(t => <option key={t} value={t}>{t}</option>)}</select>
              </div>
              <textarea className="w-full px-4 py-3 bg-gray-50 rounded-2xl resize-none" value={editingItem.description} onChange={(e) => setEditingItem({...editingItem, description: e.target.value})} rows={3} placeholder="Description" />
              
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1">Photo</label>
                <div onClick={() => itemFileRef.current?.click()} className="relative h-32 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer group">
                  {editingItem.imageUrl ? <img src={editingItem.imageUrl} className="w-full h-full object-cover rounded-2xl" /> : <Upload className="w-6 h-6 text-gray-300" />}
                  <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-2xl transition-opacity"><Camera className="w-6 h-6 text-white" /></div>
                </div>
                <input type="file" ref={itemFileRef} className="hidden" accept="image/*" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => setEditingItem({...editingItem, imageUrl: reader.result as string});
                    reader.readAsDataURL(file);
                  }
                }} />
              </div>
              <button type="submit" className="w-full bg-primary text-surface py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/20">Save Changes</button>
            </form>
          </div>
        </div>
      )}

      {editingEvent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary/30 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[32px] p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-black">Edit Event</h2><button onClick={() => setEditingEvent(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-6 h-6 text-gray-400" /></button></div>
            <form onSubmit={handleUpdateEvent} className="space-y-4">
              <input className="w-full px-4 py-3 bg-gray-50 rounded-2xl outline-none" value={editingEvent.title} onChange={(e) => setEditingEvent({...editingEvent, title: e.target.value})} placeholder="Event Title" />
              <div className="grid grid-cols-2 gap-4">
                <input type="datetime-local" className="w-full px-4 py-3 bg-gray-50 rounded-2xl" value={editingEvent.date} onChange={(e) => setEditingEvent({...editingEvent, date: e.target.value})} />
                <input className="w-full px-4 py-3 bg-gray-50 rounded-2xl" value={editingEvent.location} onChange={(e) => setEditingEvent({...editingEvent, location: e.target.value})} placeholder="Location" />
              </div>
              <textarea className="w-full px-4 py-3 bg-gray-50 rounded-2xl resize-none" value={editingEvent.description} onChange={(e) => setEditingEvent({...editingEvent, description: e.target.value})} rows={3} placeholder="Description" />
              
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1">Background Image</label>
                <div onClick={() => eventFileRef.current?.click()} className="relative h-32 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer group">
                  {editingEvent.imageUrl ? <img src={editingEvent.imageUrl} className="w-full h-full object-cover rounded-2xl" /> : <Upload className="w-6 h-6 text-gray-300" />}
                  <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-2xl transition-opacity"><Camera className="w-6 h-6 text-white" /></div>
                </div>
                <input type="file" ref={eventFileRef} className="hidden" accept="image/*" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => setEditingEvent({...editingEvent, imageUrl: reader.result as string});
                    reader.readAsDataURL(file);
                  }
                }} />
              </div>
              <button type="submit" className="w-full bg-primary text-surface py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/20">Update Event</button>
            </form>
          </div>
        </div>
      )}

      {isEditingProfile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary/30 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[32px] p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-black">Update Profile</h2><button onClick={() => setIsEditingProfile(false)}><X className="w-6 h-6 text-gray-400" /></button></div>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <input className="w-full px-4 py-3 bg-gray-50 rounded-2xl outline-none" value={profileFormData.name} onChange={(e) => setProfileFormData({...profileFormData, name: e.target.value})} placeholder="Name" />
              <input className="w-full px-4 py-3 bg-gray-50 rounded-2xl outline-none" value={profileFormData.email} onChange={(e) => setProfileFormData({...profileFormData, email: e.target.value})} placeholder="Email" />
              <input className="w-full px-4 py-3 bg-gray-50 rounded-2xl outline-none" value={profileFormData.flatNumber} onChange={(e) => setProfileFormData({...profileFormData, flatNumber: e.target.value})} placeholder="Flat Number" />
              <button type="submit" className="w-full bg-primary text-surface py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/20">Save Profile</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
