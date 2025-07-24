import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createDealer } from "@/services/dealerApi";
import { QUERY_KEYS } from "@/lib/queryKeys";

interface CreateDealerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type DealerFormValues = {
  region: "usa" | "uk";
  dealerId: string;
};

export function CreateDealerDialog({
  open,
  onOpenChange,
}: CreateDealerDialogProps) {
  const queryClient = useQueryClient();
  const form = useForm<DealerFormValues>({
    defaultValues: {
      region: "usa",
      dealerId: "",
    },
    mode: "onTouched",
  });

  const mutation = useMutation({
    mutationFn: (values: DealerFormValues) =>
      createDealer(values.dealerId, values.region),
    onSuccess: () => {
      onOpenChange(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dealers });
    },
    onError: (err: any) => {
      form.setError("root", {
        type: "manual",
        message: err.message || "Failed to create dealer",
      });
    },
  });

  function onSubmit(values: DealerFormValues) {
    mutation.mutate(values);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Dealer</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="region"
              rules={{ required: "Region is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Region</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select region" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="usa">USA</SelectItem>
                        <SelectItem value="uk">UK</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dealerId"
              rules={{ required: "Dealer ID is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dealer ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter dealer ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.formState.errors.root && (
              <div className="text-red-500 text-sm">
                {form.formState.errors.root.message}
              </div>
            )}
            <div className="pt-2 flex justify-end">
              <Button
                type="submit"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
