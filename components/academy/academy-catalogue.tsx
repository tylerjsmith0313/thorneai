"use client"

import { useState, cloneElement, type ReactElement } from "react"
import {
  BookOpen,
  Brain,
  Heart,
  DollarSign,
  Dumbbell,
  Smartphone,
  Search,
  Filter,
  Sparkles,
  Clock,
  Play,
  Star,
  ChevronRight,
  GraduationCap,
} from "lucide-react"
import { SectionHeader } from "@/components/ui/section-header"
import { BaseInput } from "@/components/ui/base-input"

type Category = "All" | "Business" | "Wellness" | "Finance" | "Tech"

interface Course {
  id: number
  title: string
  category: Category
  duration: string
  instructor: string
  rating: number
  image: string
  icon: ReactElement
  color: string
}

interface AcademyCatalogueProps {
  onOpenCourse?: (id: string) => void
}

export function AcademyCatalogue({ onOpenCourse }: AcademyCatalogueProps) {
  const [activeCategory, setActiveCategory] = useState<Category>("All")
  const [search, setSearch] = useState("")

  const courses: Course[] = [
    {
      id: 1,
      title: "Enterprise Outreach Strategy",
      category: "Business",
      duration: "4.5h",
      instructor: "Sarah Thorne",
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=800",
      icon: <Brain />,
      color: "indigo",
    },
    {
      id: 2,
      title: "Precision Nutrition for High Performers",
      category: "Wellness",
      duration: "2h",
      instructor: "Dr. Marc Evans",
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=800",
      icon: <Heart />,
      color: "rose",
    },
    {
      id: 3,
      title: "Personal Wealth Management",
      category: "Finance",
      duration: "6h",
      instructor: "James Sterling",
      rating: 5.0,
      image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=800",
      icon: <DollarSign />,
      color: "emerald",
    },
    {
      id: 4,
      title: "HIIT: Peak Efficiency Workouts",
      category: "Wellness",
      duration: "3h",
      instructor: "Alex Rivera",
      rating: 4.7,
      image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800",
      icon: <Dumbbell />,
      color: "amber",
    },
    {
      id: 5,
      title: "Mastering the AI Intelligence Layer",
      category: "Tech",
      duration: "5.5h",
      instructor: "Thorne AI Core",
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=800",
      icon: <Smartphone />,
      color: "violet",
    },
    {
      id: 6,
      title: "Advanced Sales Psychology",
      category: "Business",
      duration: "4h",
      instructor: "Michael Chen",
      rating: 4.6,
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800",
      icon: <GraduationCap />,
      color: "blue",
    },
  ]

  const filtered = courses.filter(
    (c) =>
      (activeCategory === "All" || c.category === activeCategory) &&
      c.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <SectionHeader
          title="Academy Catalogue"
          description="Explore high-impact courses for professional and personal growth."
          icon={<BookOpen size={24} />}
        />
        <div className="flex items-center gap-4 shrink-0">
          <div className="w-64">
            <BaseInput
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search size={18} />}
            />
          </div>
          <button className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
        {(["All", "Business", "Wellness", "Finance", "Tech"] as Category[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              activeCategory === cat
                ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100"
                : "bg-white border border-slate-200 text-slate-400 hover:border-indigo-200 hover:text-indigo-600"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Featured Header Card */}
      <div className="bg-slate-900 rounded-[48px] p-12 text-white relative overflow-hidden group shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 bg-indigo-500/20 px-4 py-1.5 rounded-full border border-indigo-500/30">
            <Sparkles size={14} className="text-indigo-400" />
            <span className="text-[10px] font-black uppercase tracking-widest">Recommended for You</span>
          </div>
          <h2 className="text-4xl font-black tracking-tight leading-none uppercase">
            Holistic Performance Mastery
          </h2>
          <p className="text-slate-400 text-lg font-medium leading-relaxed italic">
            "Integration of physical wellness, financial literacy, and tactical business strategy."
          </p>
          <div className="flex items-center gap-8 pt-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                <GraduationCap size={24} className="text-indigo-400" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">
                  Course Series
                </p>
                <p className="text-sm font-bold mt-1">12 Training Modules</p>
              </div>
            </div>
            <button className="px-10 py-5 bg-white text-indigo-900 font-black rounded-3xl text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10">
              Start Pathway
            </button>
          </div>
        </div>

        <div className="absolute top-0 right-0 w-1/3 h-full overflow-hidden opacity-40 group-hover:opacity-60 transition-opacity">
          <img
            src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800"
            className="w-full h-full object-cover grayscale brightness-50"
            alt="Learning"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-slate-900 via-transparent to-slate-900" />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filtered.map((course) => (
          <div
            key={course.id}
            onClick={() => onOpenCourse?.(course.id.toString())}
            className="bg-white border border-slate-100 rounded-[40px] overflow-hidden group hover:shadow-2xl hover:shadow-indigo-100/50 transition-all flex flex-col cursor-pointer"
          >
            <div className="h-56 relative overflow-hidden">
              <img
                src={course.image || "/placeholder.svg"}
                alt={course.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute top-6 left-6">
                <div className="p-3 rounded-2xl bg-white text-indigo-600 shadow-xl">
                  {cloneElement(course.icon, { size: 20 })}
                </div>
              </div>
              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star size={14} className="text-amber-400 fill-amber-400" />
                  <span className="text-xs font-black text-white">{course.rating}</span>
                </div>
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-[9px] font-black text-white uppercase tracking-widest">
                  {course.category}
                </span>
              </div>
            </div>

            <div className="p-8 flex-1 flex flex-col">
              <h4 className="text-xl font-black text-slate-900 leading-tight mb-2 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                {course.title}
              </h4>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
                By {course.instructor} <Clock size={12} className="text-slate-300" /> {course.duration}
              </p>

              <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                <button className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-[0.2em] group/btn">
                  Start Training
                  <ChevronRight size={14} className="transition-transform group-hover/btn:translate-x-1" />
                </button>
                <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-400 transition-all">
                  <Play size={16} fill="currentColor" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* External Resources */}
      <div className="pt-10">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 ml-2">
          External Education Nodes
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {["Thorne Health Core", "MasterClass AI Sync", "Udemy Business Hub", "Wall Street Intel"].map(
            (label) => (
              <button
                key={label}
                className="p-6 bg-slate-50 border border-slate-200 rounded-[28px] text-center hover:bg-white hover:shadow-xl hover:border-indigo-100 transition-all group"
              >
                <GraduationCap
                  size={24}
                  className="mx-auto text-slate-300 group-hover:text-indigo-500 transition-colors mb-3"
                />
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{label}</p>
              </button>
            )
          )}
        </div>
      </div>
    </div>
  )
}
