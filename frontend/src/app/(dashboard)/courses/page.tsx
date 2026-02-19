'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Course } from '@/types';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import Button from '@/components/Button';
import { GraduationCap, ExternalLink, User } from 'lucide-react';

export default function CoursesPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCourses();
    }
  }, [isAuthenticated]);

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses');
      setCourses(res.data.data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Learning Courses</h1>
          <p className="text-slate-500">Upskill with curated courses</p>
        </div>
        {user?.role === 'admin' && (
          <Button onClick={() => router.push('/courses/new')}>Add Course</Button>
        )}
      </div>

      {courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="flex flex-col">
              {course.thumbnailUrl && (
                <div className="h-40 bg-slate-100 rounded-lg mb-4 overflow-hidden">
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <h3 className="text-lg font-semibold text-slate-800 mb-2">{course.title}</h3>
              <p className="text-slate-600 text-sm mb-4 flex-1">{course.description}</p>
              <div className="flex items-center text-sm text-slate-500 mb-4">
                <User className="w-4 h-4 mr-1" />
                {course.instructor}
              </div>
              <a
                href={course.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-2 w-full py-2 px-4 bg-secondary text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <span>View Course</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-800 mb-2">No courses available</h3>
          <p className="text-slate-500">Check back later for new courses</p>
        </Card>
      )}
    </div>
  );
}
