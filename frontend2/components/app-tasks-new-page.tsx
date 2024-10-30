"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarIcon, ClockIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z
  .object({
    title: z.string().min(2, {
      message: "タイトルは2文字以上で入力してください。",
    }),
    startDateTime: z.date({
      required_error: "開始日時を選択してください。",
    }),
    endDateTime: z.date({
      required_error: "終了日時を選択してください。",
    }),
    worker: z.string().min(1, {
      message: "作業者を入力してください。",
    }),
    verifier: z.string().min(1, {
      message: "確認者を入力してください。",
    }),
    target: z.string().min(1, {
      message: "対象を入力してください。",
    }),
    client: z.string().min(1, {
      message: "クライアントを入力してください。",
    }),
    content: z.string().min(10, {
      message: "内容は10文字以上で入力してください。",
    }),
  })
  .refine((data) => data.endDateTime > data.startDateTime, {
    message: "終了日時は開始日時より後である必要があります。",
    path: ["endDateTime"],
  });

export function Page() {
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      startDateTime: new Date(),
      endDateTime: new Date(new Date().getTime() + 60 * 60 * 1000), // 1時間後
      worker: "",
      verifier: "",
      target: "",
      client: "",
      content: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    toast({
      title: "作業連絡が送信されました",
      description: "作業連絡が正常に登録されました。",
    });
    router.push("/tasks");
  }

  const DateTimePicker = ({ field, label }: { field: any; label: string }) => {
    const [date, setDate] = useState<Date | undefined>(field.value);
    const [time, setTime] = useState(
      format(field.value || new Date(), "HH:mm"),
    );

    const handleDateSelect = (newDate: Date | undefined) => {
      if (newDate) {
        const [hours, minutes] = time.split(":").map(Number);
        const updatedDate = new Date(newDate);
        updatedDate.setHours(hours);
        updatedDate.setMinutes(minutes);
        setDate(updatedDate);
        field.onChange(updatedDate);
      }
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTime = e.target.value;
      setTime(newTime);
      if (date) {
        const [hours, minutes] = newTime.split(":").map(Number);
        const updatedDate = new Date(date);
        updatedDate.setHours(hours);
        updatedDate.setMinutes(minutes);
        field.onChange(updatedDate);
      }
    };

    return (
      <FormItem className="flex flex-col">
        <FormLabel>{label}</FormLabel>
        <Popover>
          <PopoverTrigger asChild>
            <FormControl>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full pl-3 text-left font-normal",
                  !date && "text-muted-foreground",
                )}
              >
                {date ? (
                  format(date, "yyyy年MM月dd日 HH:mm")
                ) : (
                  <span>日時を選択</span>
                )}
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </FormControl>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              initialFocus
            />
            <div className="p-3 border-t flex items-center">
              <ClockIcon className="mr-2 h-4 w-4 opacity-50" />
              <Input
                type="time"
                value={time}
                onChange={handleTimeChange}
                className="w-full"
              />
            </div>
          </PopoverContent>
        </Popover>
        <FormMessage />
      </FormItem>
    );
  };

  return (
    <div className="container mx-auto py-10 px-4 md:px-6 lg:px-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">新規作業連絡</CardTitle>
          <CardDescription>作業の詳細を入力してください。</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>タイトル</FormLabel>
                    <FormControl>
                      <Input placeholder="作業タイトルを入力" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDateTime"
                  render={({ field }) => (
                    <DateTimePicker field={field} label="開始日時" />
                  )}
                />
                <FormField
                  control={form.control}
                  name="endDateTime"
                  render={({ field }) => (
                    <DateTimePicker field={field} label="終了日時" />
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="worker"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>作業者</FormLabel>
                      <FormControl>
                        <Input placeholder="作業者名を入力" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="verifier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>確認者</FormLabel>
                      <FormControl>
                        <Input placeholder="確認者名を入力" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="target"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>対象</FormLabel>
                      <FormControl>
                        <Input placeholder="対象を入力" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="client"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>クライアント</FormLabel>
                      <FormControl>
                        <Input placeholder="クライアント名を入力" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>内容</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="作業内容の詳細を入力してください"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                作業連絡を送信
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

