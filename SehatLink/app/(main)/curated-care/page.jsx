"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, MapPin, Search, Clock, IndianRupee } from "lucide-react";
import { SPECIALTIES } from "@/lib/specialities";

export default function CuratedCarePage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [location, setLocation] = useState("");
  const [specialty, setSpecialty] = useState("__all__");

  const handleSearch = async () => {
    const effectiveSpecialty = specialty && specialty !== "__all__" ? specialty : "";
    if (!location.trim() && !effectiveSpecialty.trim()) {
      return;
    }

    setLoading(true);
    setResults(null);

    try {
      const params = new URLSearchParams();
      if (location.trim()) params.append("location", location.trim());
      if (effectiveSpecialty.trim()) params.append("specialty", effectiveSpecialty.trim());

      const response = await fetch(`/api/curated-care?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to search");
      }

      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Find Healthcare Providers</h1>
          <p className="text-muted-foreground">
            Search for doctors and hospitals by location and specialty
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Search Healthcare Providers</CardTitle>
            <CardDescription>
              Enter a location (city, area, or pincode) and optionally select a
              specialty to find nearby doctors and hospitals.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="location" className="text-sm font-medium">
                    Location
                  </label>
                  <Input
                    id="location"
                    placeholder="City, area, or pincode (e.g., Kanpur)"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="specialty" className="text-sm font-medium">
                    Specialty (Optional)
                  </label>
                  <Select
                    value={specialty}
                    onValueChange={setSpecialty}
                    disabled={loading}
                  >
                    <SelectTrigger id="specialty">
                      <SelectValue placeholder="Select specialty" />
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
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 size-4" />
                    Search
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {results && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Found {results.length} provider{results.length !== 1 ? "s" : ""}
              </p>
            </div>

            {results.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <p className="text-primary font-medium mb-2">
                      No doctors found
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {specialty && specialty !== "__all__"
                        ? `No doctors found for ${specialty} in ${location || "this location"}.`
                        : `No doctors found in ${location || "this location"}.`}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {results.map((result) => (
                  <Card key={result.id}>
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1 flex-1">
                            <h3 className="font-semibold text-lg">
                              {result.doctorName}
                            </h3>
                            <Badge variant="outline">{result.specialty}</Badge>
                            <p className="text-sm text-muted-foreground">
                              {result.hospitalName}
                            </p>
                          </div>
                          <div className="text-right space-y-1">
                            <div className="flex items-center gap-1 text-sm font-medium">
                              <IndianRupee className="size-4" />
                              {result.consultationFee}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <MapPin className="size-4" />
                            <span>{result.address}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="size-4" />
                            <span>{result.opdTimings}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
