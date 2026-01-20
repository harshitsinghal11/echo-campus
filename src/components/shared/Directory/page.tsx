'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Faculty } from '@/types/faculty'
import { Search, Mail, Phone, Building, Calendar, User } from 'lucide-react'

export default function DirectoryPage() {
  const [faculty, setFaculty] = useState<Faculty[]>([])
  const [filteredFaculty, setFilteredFaculty] = useState<Faculty[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch faculty data
  useEffect(() => {
    fetchFaculty()
  }, [])

  const fetchFaculty = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('directory')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      setFaculty(data || [])
      setFilteredFaculty(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch faculty')
      console.error('Error fetching faculty:', err)
    } finally {
      setLoading(false)
    }
  }

  // Filter faculty based on search and department
  useEffect(() => {
    let filtered = faculty

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(f =>
        f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.cabin_no?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by department
    if (selectedDepartment !== 'All') {
      filtered = filtered.filter(f => f.department === selectedDepartment)
    }

    setFilteredFaculty(filtered)
  }, [searchTerm, selectedDepartment, faculty])

  // Get unique departments
  const departments = ['All', ...Array.from(new Set(faculty.map(f => f.department)))]

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Please Wait...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="text-xl font-semibold">Error loading directory</p>
          <p className="mt-2">{error}</p>
          <button 
            onClick={fetchFaculty}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Faculty Directory</h1>
          <p className="mt-2 text-gray-600">
            Browse and search our faculty members
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search Box */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by name, email, department, or cabin..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border text-black border-gray-300 rounded-lg"
              />
            </div>

            {/* Department Filter */}
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-4 py-2 border border-gray-300 text-black rounded-lg "
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredFaculty.length} of {faculty.length} faculty members
          </div>
        </div>

        {/* Faculty Grid */}
        {filteredFaculty.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-gray-600">No faculty members found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFaculty.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
              >
                {/* Name and Department */}
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {member.name}
                  </h3>
                  <p className="text-sm text-blue-600 font-medium mt-1">
                    {member.department}
                  </p>
                </div>

                {/* Contact Details */}
                <div className="space-y-3 text-sm">
                  {/* Email */}
                  <div className="flex items-start gap-2">
                    <Mail className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                    <a
                      href={`mailto:${member.email}`}
                      className="text-gray-700 hover:text-blue-600 break-all"
                    >
                      {member.email}
                    </a>
                  </div>

                  {/* Phone */}
                  {member.phone_no && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                      <a
                        href={`tel:${member.phone_no}`}
                        className="text-gray-700 hover:text-blue-600"
                      >
                        {member.phone_no}
                      </a>
                    </div>
                  )}

                  {/* Cabin */}
                  {member.cabin_no && (
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-gray-400 shrink-0" />
                      <span className="text-gray-700">
                        Cabin: {member.cabin_no}
                      </span>
                    </div>
                  )}

                  {/* Experience */}
                  {member.experience !== null && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                      <span className="text-gray-700">
                        {member.experience} years experience
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}