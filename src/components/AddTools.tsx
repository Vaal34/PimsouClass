"use client";

import * as React from "react";
import {
  ClipboardType,
  Image,
  LoaderPinwheel,
  Monitor,
  TimerIcon,
  Users,
  ChevronRight,
} from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";

// Données des outils
const data = {
  navMain: [
    {
      title: "Outils Média",
      icon: Monitor,
      isActive: true,
      items: [
        {
          title: "Photo",
          icon: Image,
        },
        {
          title: "Vidéo",
          icon: Monitor,
        },
      ],
    },
    {
      title: "Outils Pédagogiques",
      icon: ClipboardType,
      items: [
        {
          title: "Consigne",
          icon: ClipboardType,
        },
        {
          title: "Timer",
          icon: TimerIcon,
        },
      ],
    },
    {
      title: "Outils Collaboratifs",
      icon: Users,
      items: [
        {
          title: "Groupe",
          icon: Users,
        },
        {
          title: "Roue",
          icon: LoaderPinwheel,
        },
      ],
    },
  ],
  outils: [
    {
      name: "Photo",
      icon: Image,
    },
    {
      name: "Vidéo",
      icon: Monitor,
    },
    {
      name: "Consigne",
      icon: ClipboardType,
    },
    {
      name: "Timer",
      icon: TimerIcon,
    },
    {
      name: "Groupe",
      icon: Users,
    },
    {
      name: "Roue",
      icon: LoaderPinwheel,
    },
  ],
};

export function AddTools({
  setActiveTools,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  setActiveTools: (tools: any) => void;
}) {
  const handleAdd = (toolName: string) => {
    setActiveTools((prev: string[]) => [...prev, toolName]);
  };

  return (
    <Sidebar collapsible="offcanvas" variant="sidebar" {...props}>
      <SidebarHeader className="p-4 bg-chart-1">
        <div className="flex items-center justify-between">
          <h2 className="text-left text-3xl italic text-black font-black">
            Outils
          </h2>
          <SidebarTrigger />
        </div>
      </SidebarHeader>
      <SidebarContent className="flex-1 overflow-y-auto bg-chart-4">
        <SidebarGroup className="p-4">
          <SidebarGroupLabel className="italic text-sm font-semibold mb-3">
            Outils par Catégorie
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {data.navMain.map((item) => (
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={item.isActive}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        className="cursor-pointer bg-chart-1/80 hover:bg-chart-1 transition-colors duration-200 w-full justify-between p-2 h-auto data-[state=open]:bg-main data-[state=open]:outline-border data-[state=open]:text-main-foreground"
                        tooltip={item.title}
                      >
                        <div className="flex items-center gap-2">
                          {item.icon && <item.icon className="size-4" />}
                          <span className="text-sm">{item.title}</span>
                        </div>
                        <ChevronRight className="size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub className="ml-6 mt-1 space-y-1">
                        {item.items?.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              className="cursor-pointer bg-chart-1/20 hover:bg-chart-1/60 w-full justify-start p-2 h-auto text-sm"
                            >
                              <button
                                className="flex items-center gap-2 hover:scale-105 transition-transform duration-[500ms]"
                                onClick={() => handleAdd(subItem.title)}
                              >
                                {subItem.icon && (
                                  <subItem.icon className="size-4" />
                                )}
                                <span>{subItem.title}</span>
                              </button>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="p-4 group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel className="italic text-sm font-semibold text-black mb-3">
            Tous les Outils
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {data.outils.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    className="cursor-pointer bg-chart-1/20 hover:bg-chart-1/60 w-full justify-start p-2 h-auto text-sm"
                  >
                    <button
                      className="flex items-center gap-2 hover:scale-105 transition-transform duration-[500ms]"
                      onClick={() => handleAdd(item.name)}
                    >
                      {item.icon && <item.icon className="size-4" />}
                      <span>{item.name}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
