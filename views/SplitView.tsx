
import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { EXERCISE_DATABASE } from '../constants';
import { 
  ChevronRight, 
  ChevronDown,
  Play, 
  Info, 
  ListChecks, 
  Edit2, 
  Trash2, 
  Plus, 
  X, 
  GripVertical,
  Search 
} from 'lucide-react';

// DND Kit for Split Editing
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  TouchSensor
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SplitView: React.FC = () => {
  const startWorkout = useStore(state => state.startWorkout);
  const trainingSplit = useStore(state => state.trainingSplit);
  const exerciseDatabase = useStore(state => state.exerciseDatabase);
  const removeExerciseFromSplit = useStore(state => state.removeExerciseFromSplit);
  const addExerciseToSplit = useStore(state => state.addExerciseToSplit);
  const reorderExerciseInSplit = useStore(state => state.reorderExerciseInSplit);
  
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const allPossible = useMemo(() => {
    const all = Object.values(EXERCISE_DATABASE).flat();
    const unique = all.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
    return unique.filter(ex => ex.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id && over && editingDay !== null) {
      const dayExercises = exerciseDatabase[editingDay] || [];
      const oldIndex = dayExercises.findIndex(e => e.id === active.id);
      const newIndex = dayExercises.findIndex(e => e.id === over.id);
      reorderExerciseInSplit(editingDay, oldIndex, newIndex);
    }
  };

  const toggleExpand = (dayId: number) => {
    setExpandedDay(expandedDay === dayId ? null : dayId);
    if (navigator.vibrate) navigator.vibrate(10);
  };

  return (
    <div className="p-6 space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-24">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold mb-2 text-gray-900">Training Split</h2>
          <p className="text-gray-500 text-sm">Tap a routine to begin or edit.</p>
        </div>
      </header>

      {editingDay !== null && (
        <div className="fixed inset-0 z-50 bg-white p-6 flex flex-col animate-in slide-in-from-right duration-300">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black">Edit Day {editingDay}</h3>
            <button onClick={() => { setEditingDay(null); setShowAddMenu(false); setSearchTerm(''); }} className="p-2 text-gray-400"><X /></button>
          </div>

          <div className="space-y-4 overflow-y-auto flex-1 pb-10 scrollbar-hide">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Exercise Order</h4>
            
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={(exerciseDatabase[editingDay] || []).map(e => e.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {(exerciseDatabase[editingDay] || []).map((ex) => (
                    <SortableSplitItem 
                      key={ex.id} 
                      ex={ex} 
                      onRemove={() => removeExerciseFromSplit(editingDay, ex.id)} 
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            <button 
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="w-full flex items-center justify-center gap-2 py-5 border-2 border-dashed border-gray-200 rounded-[2rem] text-gray-400 font-bold hover:border-blue-500 hover:text-blue-500 transition-all mt-4"
            >
              <Plus size={20} /> Add Lift to Split
            </button>

            {showAddMenu && (
              <div className="animate-in fade-in zoom-in-95 duration-200 bg-gray-50 p-4 rounded-3xl border border-gray-100 space-y-3">
                <div className="bg-white rounded-xl flex items-center px-4 py-3 border border-gray-200 shadow-sm">
                  <Search className="text-gray-400 mr-2" size={18} />
                  <input 
                    placeholder="Search all lifts..." 
                    className="bg-transparent w-full outline-none text-sm font-medium"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                  {allPossible.map(ex => (
                    <button 
                      key={ex.id}
                      onClick={() => {
                        addExerciseToSplit(editingDay, ex.id);
                        setShowAddMenu(false);
                        setSearchTerm('');
                      }}
                      className="w-full p-4 text-left bg-white rounded-2xl font-bold text-gray-600 text-sm active:bg-blue-50 active:text-blue-600 border border-transparent active:border-blue-100 transition-all shadow-sm"
                    >
                      {ex.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => setEditingDay(null)}
            className="w-full bg-gray-900 text-white py-6 rounded-3xl font-black mt-4 shadow-xl active:scale-[0.98] transition-transform"
          >
            CONFIRM CHANGES
          </button>
        </div>
      )}

      <div className="space-y-4">
        {trainingSplit.map((day) => {
          const exercises = exerciseDatabase[day.id] || [];
          const isRest = day.id === 7;
          const isExpanded = expandedDay === day.id;

          return (
            <div 
              key={day.id} 
              className={`border border-gray-200 rounded-[2.5rem] overflow-hidden ${isRest ? 'bg-gray-100 opacity-60' : 'bg-white shadow-sm hover:shadow-md transition-shadow'}`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-1">Day {day.id}</span>
                    <h3 className="text-2xl font-black text-gray-900">{day.name}</h3>
                  </div>
                  {isRest ? (
                    <div className="p-2 bg-white rounded-2xl text-gray-300">
                      <Info size={24} />
                    </div>
                  ) : (
                    <div className="flex gap-2">
                       <button 
                        onClick={() => setEditingDay(day.id)}
                        className="p-4 bg-gray-50 rounded-2xl text-gray-400 active:scale-90 active:bg-blue-50 active:text-blue-500 transition-all"
                      >
                        <Edit2 size={24} />
                      </button>
                      <button 
                        onClick={() => startWorkout(day.id, day.name)}
                        className="p-4 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-100 active:scale-90 transition-all"
                      >
                        <Play size={24} fill="currentColor" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {day.muscleGroups.map(mg => (
                    <span key={mg} className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-[9px] font-black uppercase tracking-widest">{mg}</span>
                  ))}
                </div>

                {!isRest && (
                  <>
                    <div className="flex items-center justify-between pt-5 border-t border-gray-50 mt-4">
                      <div className="flex items-center gap-2 text-gray-400">
                        <ListChecks size={16} />
                        <span className="text-[11px] font-black uppercase tracking-widest">{exercises.length} Exercises</span>
                      </div>
                      <button 
                        onClick={() => toggleExpand(day.id)}
                        className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1 transition-colors ${isExpanded ? 'text-gray-400' : 'text-blue-500'}`}
                      >
                        {isExpanded ? 'Hide Routine' : 'View Routine'} 
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-gray-50 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        {exercises.length > 0 ? exercises.map((ex, idx) => (
                          <div key={ex.id + idx} className="flex items-center gap-4 bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
                            <div className="w-8 h-8 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-[10px] font-black text-gray-300">
                              {idx + 1}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-800">{ex.name}</p>
                              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{ex.targetMuscle}</p>
                            </div>
                          </div>
                        )) : (
                          <p className="text-center py-4 text-xs font-bold text-gray-300 uppercase tracking-widest italic">No exercises added yet</p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface SortableSplitItemProps {
  ex: any;
  onRemove: () => void;
}

const SortableSplitItem: React.FC<SortableSplitItemProps> = ({ ex, onRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: ex.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.6 : 1
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`bg-gray-50 p-4 rounded-3xl flex items-center justify-between border border-gray-100 ${isDragging ? 'shadow-lg ring-1 ring-blue-300' : ''}`}
    >
      <div className="flex items-center gap-3">
        <div {...attributes} {...listeners} className="p-2 cursor-grab active:cursor-grabbing text-gray-300 hover:text-blue-500 transition-colors">
          <GripVertical size={20} />
        </div>
        <span className="font-bold text-gray-800">{ex.name}</span>
      </div>
      <button 
        onClick={onRemove}
        className="p-2 text-red-300 hover:text-red-500 transition-colors"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
};

export default SplitView;
