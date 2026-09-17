import React, { useState } from 'react';
import {
  Clock,
  ShieldCheck,
  CheckCircle2,
  Camera,
  Heart,
  Calendar,
  Sparkles,
  Award,
  ChevronRight,
  Sun,
  Utensils,
  BookOpen,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardBody, Badge, Button, Avatar } from '../components/ui';

export const ParentPortalPage = () => {
  const [pickupCodeVisible, setPickupCodeVisible] = useState(false);

  const timelineEvents = [
    {
      time: '8:45 AM',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
      title: 'Morning Check-In',
      description: 'Leo arrived safely with Parent. Temperature 98.4°F.',
      status: 'success',
    },
    {
      time: '10:00 AM',
      icon: <Sparkles className="w-4 h-4 text-amber-500" />,
      title: 'Montessori Sensory Discovery',
      description: 'Explored geometric wooden cylinders and tactile sandpaper numerals.',
      photo: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=300&auto=format&fit=crop&q=80',
    },
    {
      time: '11:45 AM',
      icon: <Utensils className="w-4 h-4 text-skybrand-500" />,
      title: 'Healthy Lunch & Snack',
      description: 'Ate full portion of whole wheat pasta & fresh apple slices.',
    },
    {
      time: '1:00 PM',
      icon: <Sun className="w-4 h-4 text-amber-500" />,
      title: 'Afternoon Rest / Quiet Reading',
      description: 'Rested quietly while listening to audio storybook.',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Quick Status Pill */}
      <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <div>
            <h4 className="text-xs font-bold text-emerald-950">Leo is happily at school</h4>
            <p className="text-[10px] text-emerald-700">Checked in 8:45 AM • Pick-up scheduled 3:30 PM</p>
          </div>
        </div>
      </div>

      {/* Security Pickup PIN Card */}
      <Card className="border-skybrand-200 bg-gradient-to-br from-skybrand-50/50 to-white">
        <CardBody className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-skybrand-100 text-skybrand-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Authorized Pickup PIN</h4>
              <p className="text-[10px] text-slate-500">Show to teacher at dismissal</p>
            </div>
          </div>
          <div>
            {pickupCodeVisible ? (
              <span className="font-mono text-base font-extrabold text-brand-700 tracking-widest px-3 py-1 bg-white rounded-lg border border-brand-200 shadow-xs">
                7429
              </span>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPickupCodeVisible(true)}
              >
                Reveal PIN
              </Button>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Teacher Daily Note */}
      <Card>
        <CardHeader className="p-4 pb-3">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Avatar
                name="Sarah Jenkins"
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"
                size="xs"
              />
              <span className="text-xs font-bold text-slate-900">Teacher's Note</span>
            </div>
            <span className="text-[10px] text-slate-400">11:15 AM</span>
          </div>
        </CardHeader>
        <CardBody className="p-4 pt-0 text-xs text-slate-600 leading-relaxed">
          "Leo was enthusiastic during phonics circle time today! He demonstrated great curiosity matching letter sounds to animal names."
        </CardBody>
      </Card>

      {/* Daily Timeline */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Today's School Day
          </h3>
          <span className="text-[10px] text-slate-400 font-medium">Thursday, Sept 17</span>
        </div>

        <div className="space-y-3">
          {timelineEvents.map((evt, idx) => (
            <div
              key={idx}
              className="p-3.5 bg-white rounded-2xl border border-slate-100 shadow-xs flex items-start gap-3"
            >
              <div className="p-2 rounded-xl bg-slate-50 shrink-0 mt-0.5 border border-slate-100">
                {evt.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-slate-900">{evt.title}</h5>
                  <span className="text-[10px] font-mono text-slate-400">{evt.time}</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  {evt.description}
                </p>
                {evt.photo && (
                  <div className="mt-2 rounded-xl overflow-hidden border border-slate-100 max-h-36">
                    <img
                      src={evt.photo}
                      alt="Activity"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
