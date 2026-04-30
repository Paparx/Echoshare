import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Search, Filter, Plus, CheckCircle2, XCircle, Info, Package, User as UserIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ItemCategory, ItemType } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion } from 'framer-motion';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Items = () => {
  const { items, updateItem, loading } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ItemCategory | 'All'>('All');
  const [typeFilter, setTypeFilter] = useState<ItemType | 'All'>('All');
  const [availabilityFilter, setAvailabilityFilter] = useState<'All' | 'Available' | 'Not Available'>('All');
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  const filteredItems = items
    .filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
      const matchesType = typeFilter === 'All' || item.type === typeFilter;
      const matchesAvailability = 
        availabilityFilter === 'All' || 
        (availabilityFilter === 'Available' && item.available) || 
        (availabilityFilter === 'Not Available' && !item.available);
      
      return matchesSearch && matchesCategory && matchesType && matchesAvailability;
    })
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const toggleFlip = (itemId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setFlippedCards(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const handleToggleAvailability = async (itemId: string, currentStatus: boolean) => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await updateItem(itemId, { available: !currentStatus });
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const categories: (ItemCategory | 'All')[] = ['All', 'Tools', 'Books', 'Electronics', 'Kitchenware', 'Sports', 'Other'];
  const types: (ItemType | 'All')[] = ['All', 'lend', 'donate', 'rent'];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Community Items</h1>
          <p className="text-gray-500 mt-1">Discover what your neighbors have posted.</p>
        </div>
        <Link 
          to="/items/add"
          className="bg-primary text-surface px-6 py-3 rounded-2xl font-semibold flex items-center space-x-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/10"
        >
          <Plus className="w-5 h-5" />
          <span>Post an Item</span>
        </Link>
      </div>

      <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name or description..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Filter className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              className="pl-9 pr-8 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary appearance-none text-sm font-medium text-gray-600"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
            >
              {categories.map(cat => <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>)}
            </select>
          </div>
          <div className="relative">
            <select
              className="pl-4 pr-8 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary appearance-none text-sm font-medium text-gray-600"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
            >
              {types.map(t => <option key={t} value={t}>{t === 'All' ? 'All Types' : t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
          </div>
          <div className="relative">
            <select
              className="pl-4 pr-8 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary appearance-none text-sm font-medium text-gray-600"
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value as any)}
            >
              <option value="All">All Availability</option>
              <option value="Available">Available</option>
              <option value="Not Available">Not Available</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="h-64 bg-gray-50 animate-pulse rounded-3xl"></div>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-16 md:py-20 bg-white rounded-[32px] border-2 border-dashed border-gray-100 mx-2">
          <Info className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-black text-gray-900 uppercase">No items found</h3>
          <p className="text-gray-400 font-medium text-sm mt-1 px-4">Try adjusting your filters or be the first to post something!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredItems.map((item) => {
            const isOwner = user?.id === item.ownerId;
            const isFlipped = flippedCards[item.id];

            return (
              <div 
                key={item.id} 
                className="relative h-[420px] w-full [perspective:1000px] group"
              >
                <motion.div
                  initial={false}
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
                  className="relative w-full h-full [transform-style:preserve-3d] cursor-pointer"
                  onClick={(e) => {
                    // Only flip if not clicking a nested button and user is not owner
                    if ((e.target as HTMLElement).tagName !== 'BUTTON' && !isOwner && item.available) {
                      toggleFlip(item.id);
                    }
                  }}
                >
                  {/* Front of Card */}
                  <div className="absolute inset-0 [backface-visibility:hidden] bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-sm group-hover:shadow-xl group-hover:shadow-primary/5 transition-all flex flex-col">
                    <div className="relative h-48 bg-gray-100">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <Package className="w-12 h-12" />
                        </div>
                      )}
                      <div className="absolute top-4 left-4 flex gap-2">
                        <span className="px-3 py-1 bg-surface/90 backdrop-blur-sm rounded-full text-[10px] font-black text-primary shadow-sm uppercase tracking-wider">
                          {item.type}
                        </span>
                        <span className="px-3 py-1 bg-secondary rounded-full text-[10px] font-black text-surface shadow-sm uppercase tracking-wider">
                          {item.category}
                        </span>
                      </div>
                      {!item.available && (
                        <div className="absolute inset-0 bg-primary/40 backdrop-blur-[2px] flex items-center justify-center">
                          <span className="bg-surface px-4 py-2 rounded-xl font-bold text-primary shadow-lg">Not Available</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">{item.title}</h3>
                      </div>
                      <p className="text-gray-500 text-sm line-clamp-3 mb-4 leading-relaxed">{item.description}</p>
                      
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Owner</span>
                          <span className="text-sm font-semibold text-gray-700">{item.ownerName}</span>
                        </div>
                        
                        {isOwner ? (
                          <button
                            onClick={() => handleToggleAvailability(item.id, item.available)}
                            className={cn(
                              "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2",
                              item.available 
                                ? "bg-amber-50 text-amber-600 hover:bg-amber-100" 
                                : "bg-primary/10 text-primary hover:bg-primary/20"
                            )}
                          >
                            {item.available ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                            <span>{item.available ? 'Mark Borrowed' : 'Mark Available'}</span>
                          </button>
                        ) : item.available ? (
                          <button
                            onClick={() => toggleFlip(item.id)}
                            className="bg-primary text-surface px-4 py-2 rounded-xl text-xs font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/10"
                          >
                            Borrow Item
                          </button>
                        ) : (
                          <span className="text-gray-400 text-xs font-medium italic">Wait for return</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Back of Card */}
                  <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-primary text-surface rounded-[32px] p-6 md:p-8 flex flex-col items-center justify-center text-center border-4 border-accent/20 shadow-2xl overflow-hidden">
                    <div className="bg-accent/20 p-3 md:p-4 rounded-full mb-4 shrink-0">
                      <UserIcon className="w-8 h-8 md:w-12 md:h-12 text-accent" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-black mb-1 uppercase tracking-tighter">Contact Details</h3>
                    <p className="text-accent font-bold text-lg md:text-xl mb-4 md:mb-6 leading-none">{item.ownerName}</p>
                    
                    <div className="space-y-3 md:space-y-4 mb-6 md:mb-8 w-full">
                      <div className="bg-white/10 py-3 md:py-4 px-2 rounded-2xl border border-white/10 transition-colors">
                        <p className="text-[9px] md:text-[10px] uppercase font-black tracking-[0.2em] text-accent/70 mb-1">Email Address</p>
                        <p className="font-bold text-sm md:text-base break-all px-2">{item.ownerEmail || 'Email Hidden'}</p>
                      </div>
                      
                      <div className="bg-white/10 py-2 md:py-3 rounded-2xl border border-white/10">
                        <p className="text-[9px] md:text-[10px] uppercase font-black tracking-widest text-white/50 mb-1">Community Policy</p>
                        <p className="font-bold text-[10px] md:text-xs">Handle with care & return promptly</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4 w-full">
                      <button
                        onClick={() => toggleFlip(item.id)}
                        className="w-full py-3.5 px-4 bg-white text-primary rounded-[20px] font-black text-xs uppercase tracking-widest hover:bg-accent transition-all active:scale-95 shadow-lg"
                      >
                        Go Back
                      </button>
                      <p className="text-[9px] font-black uppercase text-accent/40 tracking-widest leading-tight px-4">
                        Please coordinate with the owner. <br />
                        Only they can update the availability.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Items;
