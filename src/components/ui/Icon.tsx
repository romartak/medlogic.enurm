import {
  Activity, Award, Baby, Bone, BookOpen, Brain, BrainCircuit, Bug, Crown, Droplet, Droplets, Eye, FlaskConical, Flame,
  Footprints, Gamepad2, GraduationCap, Hand, HeartPulse, Layers, Medal, Microscope, Pill, Rocket, Scale, Scissors, Siren,
  Sparkles, Stethoscope, Target, Users, Venus, Wind, Zap, type LucideIcon,
} from 'lucide-react'

const ICONS: Record<string, LucideIcon> = {
  activity: Activity,
  award: Award,
  baby: Baby,
  bone: Bone,
  'book-open': BookOpen,
  brain: Brain,
  'brain-circuit': BrainCircuit,
  bug: Bug,
  crown: Crown,
  droplet: Droplet,
  droplets: Droplets,
  eye: Eye,
  'flask-conical': FlaskConical,
  flame: Flame,
  footprints: Footprints,
  'gamepad-2': Gamepad2,
  'graduation-cap': GraduationCap,
  hand: Hand,
  'heart-pulse': HeartPulse,
  layers: Layers,
  medal: Medal,
  microscope: Microscope,
  pill: Pill,
  rocket: Rocket,
  scale: Scale,
  scissors: Scissors,
  siren: Siren,
  sparkles: Sparkles,
  stethoscope: Stethoscope,
  target: Target,
  users: Users,
  venus: Venus,
  wind: Wind,
  zap: Zap,
}

/** Ícono a partir de un nombre guardado en los datos (p. ej. "heart-pulse"). */
export function Icon({ name, className, strokeWidth }: { name: string; className?: string; strokeWidth?: number }) {
  const C = ICONS[name] ?? BookOpen
  return <C className={className} strokeWidth={strokeWidth} aria-hidden />
}
