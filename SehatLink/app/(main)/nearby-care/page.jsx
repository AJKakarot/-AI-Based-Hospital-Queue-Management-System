"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, MapPin, AlertCircle, Search, Clock } from "lucide-react";
import { SPECIALTIES } from "@/lib/specialities";

export default function NearbyCarePage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [specialty, setSpecialty] = useState("__all__");
  const [searchLocation, setSearchLocation] = useState(null);

  const fetchCuratedCare = useCallback(async (locationText = null, specialtyText = null) => {
    try {
      const params = new URLSearchParams();
      if (locationText) {
        params.append("location", locationText);
      }
      if (specialtyText) {
        params.append("specialty", specialtyText);
      }

      if (params.toString() === "") {
        setError("Please provide location or specialty");
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/curated-care?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch healthcare providers");
      }

      const data = await response.json();
      setResults(data.results || []);
      setSearchLocation(locationText || null);
    } catch (err) {
      setError(err.message || "Unable to find healthcare providers. Please try again.");
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLocationSearch = (e) => {
    e.preventDefault();
    if (!searchText.trim() && (specialty === "__all__" || !specialty)) {
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);
    setSearchLocation(null);

    fetchCuratedCare(searchText.trim() || null, specialty && specialty !== "__all__" ? specialty : null);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Nearby Care</h1>
          <p className="text-muted-foreground">
            Find hospitals and doctors near your location
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Find Nearby Hospitals & Doctors</CardTitle>
            <CardDescription>
              Search by location (city, area, or pincode) to find healthcare
              providers from our verified database.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleLocationSearch} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input
                  type="text"
                  placeholder="Search location (city, area, or pincode)"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  disabled={loading}
                  className="md:col-span-2"
                />
                <Select value={specialty} onValueChange={setSpecialty} disabled={loading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select specialty (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All Specialties</SelectItem>
                    {SPECIALTIES.map((spec) => (
                      <SelectItem key={spec.name} value={spec.name}>
                        {spec.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                type="submit" 
                disabled={loading || (!searchText.trim() && (specialty === "__all__" || !specialty))}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 size-4" />
                    Search Healthcare Providers
                  </>
                )}
              </Button>
            </form>


            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
                <div className="flex items-start gap-3">
                  <AlertCircle className="size-5 text-destructive mt-0.5" />
                  <div className="space-y-2 flex-1">
                    <p className="text-sm font-medium text-destructive">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {results && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Found {results.length} provider{results.length !== 1 ? "s" : ""}
                      {searchLocation && ` in ${searchLocation}`}
                    </p>
                  </div>
                </div>

                {results.length === 0 ? (
                  <div className="text-center py-8 space-y-4">
                    <div className="space-y-2">
                      <p className="text-primary font-medium">
                        No nearby healthcare providers found
                      </p>
                      <p className="text-sm text-muted-foreground max-w-md mx-auto">
                        No doctors found for this location. Please try a
                        different city, area, or pincode.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={(e) => {
                        e.preventDefault();
                        if (searchText.trim() || (specialty && specialty !== "__all__")) {
                          handleLocationSearch(e);
                        }
                      }}
                      disabled={loading || (!searchText.trim() && (specialty === "__all__" || !specialty))}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 size-4 animate-spin" />
                          Searching...
                        </>
                      ) : (
                        "Try Another Search"
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {results.map((result, index) => (
                      <Card key={index}>
                        <CardContent className="pt-6">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-4">
                              <div className="space-y-1 flex-1">
                                <h3 className="font-semibold text-lg">
                                  {result.doctorName}
                                </h3>
                                {result.specialty && (
                                  <Badge variant="outline" className="mt-1">
                                    {result.specialty}
                                  </Badge>
                                )}
                                <p className="text-sm text-muted-foreground">
                                  {result.hospitalName}
                                </p>
                              </div>
                              <div className="text-right space-y-1">
                                <p className="text-sm font-medium">
                                  ₹{result.consultationFee}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              {result.address && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="size-4" />
                                  <span>{result.address}</span>
                                </div>
                              )}
                              {result.opdTimings && (
                                <div className="flex items-center gap-2">
                                  <Clock className="size-4" />
                                  <span>{result.opdTimings}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
