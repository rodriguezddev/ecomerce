
import * as React from "react"
import { cva, VariantProps } from "class-variance-authority"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface SidebarContextProps {
  open: boolean
  setOpen: (value: boolean) => void
  name: string
}

const SidebarContext = React.createContext<SidebarContextProps>({
  open: false,
  setOpen: () => null,
  name: "Sidebar",
})

interface SidebarProviderProps {
  children: React.ReactNode
  name?: string
}

export function SidebarProvider({
  children,
  name = "Sidebar",
}: SidebarProviderProps) {
  const [open, setOpen] = React.useState(false)
  const value = React.useMemo(
    () => ({ open, setOpen, name }),
    [open, setOpen, name]
  )

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  )
}

interface UseSidebarProps {
  name?: string
}

export function useSidebar(props?: UseSidebarProps) {
  const { name } = props || {}
  const context = React.useContext(SidebarContext)

  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }

  if (name && context.name !== name) {
    const error = new Error(
      `useSidebar with name ${name} must be used within a SidebarProvider with the same name`
    )
    error.name = "SidebarError"
    throw error
  }

  return context
}

interface SidebarTriggerProps extends React.HTMLAttributes<HTMLButtonElement> {}

export function SidebarTrigger({ className, ...props }: SidebarTriggerProps) {
  const { setOpen } = useSidebar()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setOpen(true)}
      className={cn(className)}
      {...props}
    >
      <span className="sr-only">Toggle Sidebar</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <path d="M4 18h16"></path>
        <path d="M4 12h16"></path>
        <path d="M4 6h16"></path>
      </svg>
    </Button>
  )
}

export function Sidebar({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { open, setOpen } = useSidebar()

  return (
    <>
      <div
        className={cn(
          "hidden h-full flex-col gap-6 pb-4 md:z-0 md:flex z-50",
          className
        )}
        {...props}
      >
        {children}
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-64" side="left" hideOverlay>
          {children}
        </SheetContent>
      </Sheet>
    </>
  )
}

export function SidebarHeader({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mt-6 px-4 space-y-2 flex flex-col", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function SidebarFooter({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("p-6 pb-4 flex flex-col gap-3", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function SidebarContent({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex-1 flex flex-col gap-2 overflow-y-auto", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function SidebarGroup(
  props: React.ComponentPropsWithoutRef<typeof Accordion>
) {
  return (
    <Accordion
      type="single"
      collapsible
      defaultValue="item-1"
      className="w-full"
      {...props}
    />
  )
}

export function SidebarGroupLabel({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mx-4 px-2 text-sm font-semibold text-muted-foreground", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function SidebarGroupContent({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <AccordionItem value="item-1" className="border-b-0">
      <AccordionContent className={cn("p-0", className)} {...props}>
        {children}
      </AccordionContent>
    </AccordionItem>
  )
}

export function SidebarMenu({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLUListElement>) {
  return (
    <ul
      className={cn("flex flex-col gap-1 px-2 py-1", className)}
      {...props}
    >
      {children}
    </ul>
  )
}

export function SidebarMenuItem({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLLIElement>) {
  return (
    <li
      className={cn("w-full", className)}
      {...props}
    >
      {children}
    </li>
  )
}

const sidebarMenuButtonVariants = cva(
  "w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground data-[active=true]:font-medium data-[active=true]:text-foreground",
  {
    variants: {
      variant: {
        default: "hover:bg-accent data-[active=true]:bg-accent",
        ghost: "hover:bg-transparent data-[active=true]:bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface SidebarMenuButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof sidebarMenuButtonVariants> {
  asChild?: boolean
  active?: boolean
}

export const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  SidebarMenuButtonProps
>(
  (
    { className, variant, active, asChild = false, ...props },
    ref
  ) => {
    const Comp = asChild ? React.Fragment : "button"
    const { setOpen } = useSidebar()

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      props.onClick?.(e)
      setOpen(false)
    }

    if (asChild) {
      return (
        <button
          ref={ref}
          className={cn(sidebarMenuButtonVariants({ variant, className }))}
          data-active={active}
          onClick={handleClick}
          {...props}
        />
      )
    }

    return (
      <Comp
        ref={ref}
        className={cn(sidebarMenuButtonVariants({ variant, className }))}
        data-active={active}
        onClick={handleClick}
        {...props}
      />
    )
  }
)

SidebarMenuButton.displayName = "SidebarMenuButton"
