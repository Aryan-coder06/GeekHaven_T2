import React from 'react';
import { Code, Palette, Zap, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSeedTheme } from '@/contexts/SeedThemeProvider';
import { ASSIGNMENT_SEED, ROLLNO, generateSeedColor, getSeedNumber, hashSeed } from '@/utils/seed';

export default function About() {
  const { seed, appliedTheme } = useSeedTheme();
  const seedColor = generateSeedColor(seed);
  const seedNumber = getSeedNumber(seed);
  const seedHash = hashSeed(seed);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-4">About Our Platform</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          A dynamic reselling marketplace powered by seed-based algorithms and modern web technologies
        </p>
      </div>

      {/* Seed Information */}
      <Card className="marketplace-card mb-8">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Assignment Seed Information</h2>
            <Badge variant={appliedTheme ? "default" : "destructive"} className="text-sm">
              {appliedTheme ? "Theme Applied" : "Theme Failed"}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Code className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold text-foreground mb-1">Full Seed</h3>
              <p className="font-mono text-sm bg-background px-2 py-1 rounded border">
                {seed}
              </p>
            </div>

            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Zap className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold text-foreground mb-1">Seed Number</h3>
              <p className="text-2xl font-bold text-primary">{seedNumber}</p>
              <p className="text-xs text-muted-foreground">Used for fee calculation</p>
            </div>

            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Palette className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold text-foreground mb-1">Theme Color</h3>
              <div className="flex items-center justify-center space-x-2">
                <div 
                  className="w-6 h-6 rounded-full border border-border"
                  style={{ backgroundColor: `hsl(${seedColor.h}, ${seedColor.s}%, ${seedColor.l}%)` }}
                ></div>
                <p className="text-sm font-mono">
                  HSL({seedColor.h}, {seedColor.s}%, {seedColor.l}%)
                </p>
              </div>
            </div>

            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Shield className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold text-foreground mb-1">Hash Value</h3>
              <p className="text-lg font-bold text-primary">{seedHash}</p>
              <p className="text-xs text-muted-foreground">For color generation</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <h4 className="font-semibold text-primary mb-2">How Seed-Based Features Work:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• <strong>Platform Fee:</strong> {seedNumber % 10}% calculated from seed number</li>
              <li>• <strong>Theme Colors:</strong> Generated from seed hash using HSL color space</li>
              <li>• <strong>Product IDs:</strong> Include checksum digit derived from seed</li>
              <li>• <strong>Rollno:</strong> {ROLLNO} (extracted from seed)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Technical Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <Card className="marketplace-card">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-foreground mb-4">Technology Stack</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Frontend Framework</span>
                <span className="font-medium">React + Vite</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Styling</span>
                <span className="font-medium">TailwindCSS + shadcn/ui</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">State Management</span>
                <span className="font-medium">React Context</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">HTTP Client</span>
                <span className="font-medium">Axios</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Charts</span>
                <span className="font-medium">Recharts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Icons</span>
                <span className="font-medium">Lucide React</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="marketplace-card">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-foreground mb-4">Features Implemented</h3>
            <div className="space-y-2">
              {[
                'Responsive product listings grid',
                'Dynamic shopping cart with seed-based fees',
                'Product search and filtering',
                'Seller profiles and ratings',
                'Pricing history charts',
                'Like/bookmark functionality',
                'Smooth checkout flow',
                'Dark/light theme toggle',
                'Mobile-responsive design',
                'Developer utility pages'
              ].map((feature, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                  <span className="text-sm text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Info */}
      <Card className="marketplace-card">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold text-foreground mb-4">Project Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Assignment</h4>
              <p className="text-muted-foreground text-sm">
                Reselling Platform Frontend built as per Quest Prompt specifications
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Roll Number</h4>
              <p className="font-mono text-primary text-lg">{ROLLNO}</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Deployment</h4>
              <p className="text-muted-foreground text-sm">
                Optimized for Vercel/Netlify deployment with proper routing
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}