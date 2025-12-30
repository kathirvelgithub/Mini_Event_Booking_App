"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import ProtectedRoute from "@/components/auth/protected-route"
import AppLayout from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Calendar, MapPin, Users, Clock, ImageIcon, Loader2, Upload, X } from "lucide-react"
import { eventsAPI, uploadAPI } from "@/lib/api"

export default function CreateEventPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    capacity: "",
    imageUrl: "",
  })

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please select an image file (JPEG, PNG, GIF, WebP)",
        variant: "destructive",
      })
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    setUploading(true)
    
    try {
      // Show preview immediately
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      // Upload to server
      const result = await uploadAPI.uploadImage(file)
      
      // Get the full URL for the image
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
      const baseUrl = apiUrl.replace('/api', '')
      const fullImageUrl = `${baseUrl}${result.imageUrl}`
      
      setFormData(prev => ({ ...prev, imageUrl: fullImageUrl }))
      
      toast({
        title: "Image uploaded",
        description: "Your event image has been uploaded successfully",
      })
    } catch (error) {
      setImagePreview(null)
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const removeImage = () => {
    setImagePreview(null)
    setFormData(prev => ({ ...prev, imageUrl: "" }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate capacity
    const capacity = Number.parseInt(formData.capacity)
    if (isNaN(capacity) || capacity <= 0) {
      toast({
        title: "Invalid Capacity",
        description: "Please enter a valid capacity greater than 0",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      await eventsAPI.create({
        ...formData,
        capacity,
      })

      toast({
        title: "Success!",
        description: "Event created successfully",
      })

      router.push("/my-events")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create event",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <ProtectedRoute requiredRole="organizer">
      <AppLayout>
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Create New Event</h1>
            <p className="text-muted-foreground">
              Fill in the details below to create an event that attendees can RSVP to
            </p>
          </div>

          {/* Form Card */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
              <CardDescription>Provide comprehensive information to attract more attendees</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Event Title */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    Event Title
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    type="text"
                    placeholder="Summer Music Festival 2025"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    maxLength={100}
                    className="bg-secondary/50 border-border"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Tell attendees what makes this event special..."
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={4}
                    maxLength={500}
                    className="bg-secondary/50 border-border resize-none"
                  />
                  <p className="text-xs text-muted-foreground">{formData.description.length} / 500 characters</p>
                </div>

                {/* Date and Time Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date" className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      Date
                    </Label>
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                      min={new Date().toISOString().split("T")[0]}
                      className="bg-secondary/50 border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time" className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-accent" />
                      Time
                    </Label>
                    <Input
                      id="time"
                      name="time"
                      type="time"
                      value={formData.time}
                      onChange={handleChange}
                      required
                      className="bg-secondary/50 border-border"
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-chart-3" />
                    Location
                  </Label>
                  <Input
                    id="location"
                    name="location"
                    type="text"
                    placeholder="Central Park, New York, NY"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    maxLength={200}
                    className="bg-secondary/50 border-border"
                  />
                </div>

                {/* Capacity */}
                <div className="space-y-2">
                  <Label htmlFor="capacity" className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    Event Capacity
                  </Label>
                  <Input
                    id="capacity"
                    name="capacity"
                    type="number"
                    placeholder="50"
                    value={formData.capacity}
                    onChange={handleChange}
                    required
                    min="1"
                    max="10000"
                    className="bg-secondary/50 border-border"
                  />
                  <p className="text-xs text-muted-foreground">Maximum number of attendees allowed</p>
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-accent" />
                    Event Image
                  </Label>
                  
                  {/* Image Preview */}
                  {imagePreview ? (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border">
                      <img 
                        src={imagePreview} 
                        alt="Event preview" 
                        className="w-full h-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8"
                        onClick={removeImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div 
                      className="w-full h-48 rounded-lg border-2 border-dashed border-border bg-secondary/30 flex flex-col items-center justify-center cursor-pointer hover:bg-secondary/50 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-8 h-8 text-muted-foreground animate-spin mb-2" />
                          <p className="text-sm text-muted-foreground">Uploading...</p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">Click to upload image</p>
                          <p className="text-xs text-muted-foreground mt-1">JPEG, PNG, GIF, WebP (max 5MB)</p>
                        </>
                      )}
                    </div>
                  )}
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                  
                  {/* Optional: URL input as fallback */}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-muted-foreground">Or paste image URL:</span>
                  </div>
                  <Input
                    id="imageUrl"
                    name="imageUrl"
                    type="url"
                    placeholder="https://example.com/event-image.jpg"
                    value={formData.imageUrl}
                    onChange={(e) => {
                      handleChange(e)
                      if (e.target.value) setImagePreview(e.target.value)
                    }}
                    className="bg-secondary/50 border-border"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Event...
                      </>
                    ) : (
                      "Create Event"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/dashboard")}
                    disabled={loading}
                    className="bg-transparent"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    </ProtectedRoute>
  )
}
