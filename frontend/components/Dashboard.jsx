// DashboardTest.tsx
const React = require("react");
import { useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";

function DashboardTest() {
  const [value, setValue] = useState("");
  const [selectValue, setSelectValue] = useState("");

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-8">
      {/* Card Example */}
      <Card>
        <CardHeader>
          <CardTitle>ShadCN UI Playground</CardTitle>
          <CardDescription>
            Testing different UI components in one place
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Buttons */}
          <div className="space-x-2">
            <Button>Default</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="destructive">Destructive</Button>
            <Button disabled>Disabled</Button>
            <Button>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading
            </Button>
          </div>

          <Separator />

          {/* Inputs */}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Enter your name"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>

          <Separator />

          {/* Select */}
          <div className="space-y-2">
            <Label>Choose an option</Label>
            <Select value={selectValue} onValueChange={(v) => setSelectValue(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select one" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">Option 1</SelectItem>
                <SelectItem value="option2">Option 2</SelectItem>
                <SelectItem value="option3">Option 3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Badges */}
          <div className="space-x-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>

          <Separator />

          {/* Alerts */}
          <div className="space-y-2">
            <Alert>
              <AlertDescription>This is a neutral alert.</AlertDescription>
            </Alert>
            <Alert className="bg-green-50 border-green-200">
              <AlertDescription className="text-green-700">
                ✅ Success Alert
              </AlertDescription>
            </Alert>
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertDescription className="text-yellow-700">
                ⚠️ Warning Alert
              </AlertDescription>
            </Alert>
            <Alert className="bg-red-50 border-red-200">
              <AlertDescription className="text-red-700">
                ❌ Error Alert
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-gray-500">
            This card demonstrates all ShadCN components in action.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default DashboardTest;
