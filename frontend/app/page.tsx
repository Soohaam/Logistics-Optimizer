"use client";

import Image from "next/image";
import { useState } from "react";

// Import all your ShadCN UI components
import { Button } from "ui/button";
import { Input } from "ui/input";
import { Label } from "ui/label";
import { Textarea } from "ui/textarea";
import { Checkbox } from "ui/checkbox";
import { RadioGroup, RadioGroupItem } from "ui/radio-group";
import { Switch } from "ui/switch";
import { Toggle } from "ui/toggle";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "ui/accordion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "ui/tabs";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "ui/dialog";
import { Popover, PopoverTrigger, PopoverContent } from "ui/popover";
import { Badge } from "ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "ui/avatar";
import VesselManager from "../components/VesselManager";

export default function Home() {
  const [radioValue, setRadioValue] = useState("option1");
  const [switchValue, setSwitchValue] = useState(false);

  return (
    <div className="p-8 grid gap-12 min-h-screen font-sans">
      <h1 className="text-3xl font-bold text-center">ShadCN UI Test Page</h1>

      {/* Buttons */}
      <section className="flex gap-4 flex-wrap">
        <Button>Primary Button</Button>
        <Button variant="outline">Outline Button</Button>
        <Button variant="ghost">Ghost Button</Button>
      </section>

      
        <VesselManager />
      

      {/* Inputs & Form */}
      <section className="flex flex-col gap-4 max-w-md">
        <Label htmlFor="input-test">Input</Label>
        <Input id="input-test" placeholder="Type something..." />

        <Label htmlFor="textarea-test">Textarea</Label>
        <Textarea id="textarea-test" placeholder="Write something..." />

        <Checkbox id="checkbox-test" />
        <Label htmlFor="checkbox-test">Checkbox</Label>

        <RadioGroup value={radioValue} onValueChange={setRadioValue} className="flex gap-4">
          <RadioGroupItem value="option1" id="r1" />
          <Label htmlFor="r1">Option 1</Label>

          <RadioGroupItem value="option2" id="r2" />
          <Label htmlFor="r2">Option 2</Label>
        </RadioGroup>

        <Label htmlFor="switch-test">Switch</Label>
        <Switch id="switch-test" checked={switchValue} onCheckedChange={setSwitchValue} />

        <Label htmlFor="toggle-test">Toggle</Label>
        <Toggle id="toggle-test">Toggle Me</Toggle>

        <Label htmlFor="select-test">Select</Label>
        <Select>
          <SelectTrigger id="select-test">
            <SelectValue placeholder="Choose an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="one">One</SelectItem>
            <SelectItem value="two">Two</SelectItem>
            <SelectItem value="three">Three</SelectItem>
          </SelectContent>
        </Select>
      </section>

      {/* Card */}
      <Card className="max-w-sm">
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
        </CardHeader>
        <CardContent>This is a card content.</CardContent>
      </Card>

      {/* Accordion */}
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Accordion Item 1</AccordionTrigger>
          <AccordionContent>Content for accordion 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Accordion Item 2</AccordionTrigger>
          <AccordionContent>Content for accordion 2</AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Tabs */}
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content for Tab 1</TabsContent>
        <TabsContent value="tab2">Content for Tab 2</TabsContent>
      </Tabs>

      {/* Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open Dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
          </DialogHeader>
          This is a dialog content.
        </DialogContent>
      </Dialog>

      {/* Popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button>Open Popover</Button>
        </PopoverTrigger>
        <PopoverContent>This is popover content.</PopoverContent>
      </Popover>

      {/* Avatar & Badge */}
      <section className="flex gap-4 items-center">
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>SC</AvatarFallback>
        </Avatar>
        <Badge>New</Badge>
      </section>
    </div>
  );
}
