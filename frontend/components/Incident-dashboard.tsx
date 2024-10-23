"use client"

import * as React from "react"
import { AlertCircle, CheckCircle, Clock, Search, Calendar as CalendarIcon, PlusCircle, CheckIcon, MailIcon, ChevronDown, ChevronUp } from "lucide-react"
import { format, isWithinInterval, endOfDay } from "date-fns"
import { ja } from "date-fns/locale"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"

interface IncidentResponse {
  id: number
  date: string
  content: string
  responder: string
}

interface Incident {
  id: number
  datetime: string
  status: "未着手" | "調査中" | "解決済み"
  judgment: "要対応" | "静観"
  content: string
  assignee: string
  priority: "高" | "中" | "低"
  responses: IncidentResponse[]
  from: string
  to: string
  subject: string
}

const incidents: Incident[] = [
  {
    id: 1,
    datetime: "2023-05-15 14:30",
    status: "未着手",
    judgment: "要対応",
    content: "データベースサーバーへの接続が突然失われました。アプリケーションがデータを取得・保存できない状態です。ユーザーからの報告が複数入っています。\n\n緊急対応が必要です。データベース管理者に連絡を取り、サーバーの状態を確認してください。また、一時的な代替策としてキャッシュの使用を検討してください。",
    assignee: "山田太郎",
    priority: "高",
    responses: [],
    from: "alert@system.incidenttolls.com",
    to: "support@incidenttolls.com",
    subject: "【緊急】データベース接続エラー",
  },
  {
    id: 2,
    datetime: "2023-05-15 11:45",
    status: "調査中",
    judgment: "要対応",
    content: "ユーザーから、アプリケーションの応答が通常より遅いという報告が増えています。特に検索機能と注文処理で顕著な遅延が見られます。\n\nサーバーのリソース使用率を確認し、必要に応じてスケールアップを検討してください。また、データベースのクエリ最適化も並行して進めてください。",
    assignee: "佐藤花子",
    priority: "中",
    responses: [],
    from: "monitoring@system.incidenttolls.com",
    to: "support@incidenttolls.com",
    subject: "アプリケーションのパフォーマンス低下",
  },
  {
    id: 3,
    datetime: "2023-05-14 23:15",
    status: "解決済み",
    judgment: "静観",
    content: "一部のユーザーがログインできない問題が報告されました。調査の結果、認証サーバーの一時的な過負荷が原因でした。\n\nサーバーの再起動により問題は解決しましたが、今後の対策として負荷分散の改善を検討してください。",
    assignee: "鈴木一郎",
    priority: "低",
    responses: [],
    from: "security@system.incidenttolls.com",
    to: "support@incidenttolls.com",
    subject: "ユーザー認証の問題",
  },
  {
    id: 4,
    datetime: "2023-05-14 18:00",
    status: "未着手",
    judgment: "静観",
    content: "定期バックアップジョブが失敗しました。エラーログを確認したところ、ストレージの容量不足が原因と思われます。\n\nバックアップサーバーのディスク使用量を確認し、不要なデータの削除または追加のストレージの確保を行ってください。また、バックアップ戦略の見直しも検討してください。",
    assignee: "高橋次郎",
    priority: "中",
    responses: [],
    from: "backup@system.incidenttolls.com",
    to: "support@incidenttolls.com",
    subject: "バックアップ失敗のお知らせ",
  },
]

const getStatusIcon = (status: string) => {
  switch (status) {
    case "未着手":
      return <AlertCircle className="h-5 w-5 text-red-500" />
    case "調査中":
      return <Clock className="h-5 w-5 text-yellow-500" />
    case "解決済み":
      return <CheckCircle className="h-5 w-5 text-green-500" />
    default:
      return null
  }
}

interface DataTableFacetedFilterProps {
  title: string
  options: {
    label: string
    value: string
  }[]
  value: string[]
  onChange: (value: string[]) => void
}

function DataTableFacetedFilter({
  title,
  options,
  value,
  onChange,
}: DataTableFacetedFilterProps) {
  const selectedValues = new Set(value)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <PlusCircle className="mr-2 h-4 w-4" />
          {title}
          {selectedValues.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal lg:hidden"
              >
                {selectedValues.size}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {selectedValues.size > 2 ? (
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    {selectedValues.size} 選択済み
                  </Badge>
                ) : (
                  options
                    .filter((option) => selectedValues.has(option.value))
                    .map((option) => (
                      <Badge
                        variant="secondary"
                        key={option.value}
                        className="rounded-sm px-1 font-normal"
                      >
                        {option.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder={title} />
          <CommandList>
            <CommandEmpty>結果が見つかりません。</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedValues.has(option.value)
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      if (isSelected) {
                        selectedValues.delete(option.value)
                      } else {
                        selectedValues.add(option.value)
                      }
                      const filterValues = Array.from(selectedValues)
                      onChange(filterValues)
                    }}
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <CheckIcon className={cn("h-4 w-4")} />
                    </div>
                    <span>{option.label}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => onChange([])}
                    className="justify-center text-center"
                  >
                    フィルターをクリア
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export function IncidentDashboard() {
  const [statusFilter, setStatusFilter] = React.useState<string[]>([])
  const [judgmentFilter, setJudgmentFilter] = React.useState<string[]>([])
  const [assigneeFilter, setAssigneeFilter] = React.useState<string[]>([])
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedIncident, setSelectedIncident] = React.useState<Incident | null>(null)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [newResponse, setNewResponse] = React.useState("")
  const [responderName, setResponderName] = React.useState("")
  const [incidentsState, setIncidentsState] = React.useState<Incident[]>(incidents)

  const resetFilters = () => {
    setStatusFilter([])
    setJudgmentFilter([])
    setAssigneeFilter([])
    setDateRange(undefined)
    setSearchQuery("")
  }

  const filteredIncidents = incidentsState.filter((incident) => {
    const matchesStatus = statusFilter.length === 0 || statusFilter.includes(incident.status)
    const matchesJudgment = judgmentFilter.length === 0 || judgmentFilter.includes(incident.judgment)
    const matchesAssignee = assigneeFilter.length === 0 || assigneeFilter.includes(incident.assignee)
    const matchesDate =
      !dateRange?.from ||
      !dateRange?.to ||
      isWithinInterval(new Date(incident.datetime), { 
        start: dateRange.from, 
        end: endOfDay(dateRange.to) 
      })
    const matchesSearch = incident.content.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesJudgment && matchesAssignee && matchesDate && matchesSearch
  })

  const unresolved = incidentsState.filter(i => i.status === "未着手").length
  const investigating = incidentsState.filter(i => i.status === "調査中").length

  const handleIncidentClick = (incident: Incident) => {
    setSelectedIncident(incident)
    setIsModalOpen(true)
  }

  const handleStatusUpdate = () => {
    if (selectedIncident) {
      const newResponse: IncidentResponse = {
        id: selectedIncident.responses.length + 1,
        date: format(new Date(), "yyyy-MM-dd HH:mm"),
        content: "インシデントが解決されました。",
        responder: responderName,
      }
      const updatedIncident = {
        ...selectedIncident,
        status: "解決済み" as const,
        responses: [...selectedIncident.responses, newResponse],
      }
      const updatedIncidents = incidentsState.map(inc => 
        inc.id === selectedIncident.id ? updatedIncident : inc
      )
      setIncidentsState(updatedIncidents)
      setSelectedIncident(updatedIncident)
    }
  }

  const handleResponseSubmit = () => {
    if (selectedIncident && newResponse && responderName) {
      const newIncidentResponse: IncidentResponse = {
        id: selectedIncident.responses.length + 1,
        date: format(new Date(), "yyyy-MM-dd HH:mm"),
        content: newResponse,
        responder: responderName,
      }
      const updatedIncident = {
        ...selectedIncident,
        status: "調査中" as const,
        assignee: responderName,
        responses: [...selectedIncident.responses, newIncidentResponse],
      }
      const updatedIncidents = incidentsState.map(inc => 
        inc.id === selectedIncident.id ? updatedIncident : inc
      )
      setIncidentsState(updatedIncidents)
      setSelectedIncident(updatedIncident)
      setNewResponse("")
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="col-span-1 md:col-span-1">
        <CardHeader>
          <CardTitle>未着手インシデント</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{unresolved}</div>
          <p className="text-sm text-muted-foreground">件</p>
        </CardContent>
      </Card>
      <Card className="col-span-1 md:col-span-1">
        <CardHeader>
          <CardTitle>調査中インシデント</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{investigating}</div>
          <p className="text-sm  text-muted-foreground">件</p>
        </CardContent>
      </Card>
      <Card className="col-span-2 md:col-span-2  lg:col-span-4">
        <CardHeader>
          <CardTitle>最近のインシデント</CardTitle>
          <CardDescription>
            過去24時間以内に報告されたインシデント
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-4 items-start">
            <div className="flex-1 min-w-[200px]">
              <Label className="mb-2">ステータス</Label>
              <DataTableFacetedFilter
                title="ステータス"
                options={[
                  { label: "未着手", value: "未着手" },
                  { label: "調査中", value: "調査中" },
                  { label: "解決済み", value: "解決済み" },
                ]}
                value={statusFilter}
                onChange={setStatusFilter}
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <Label className="mb-2">判定</Label>
              <DataTableFacetedFilter
                title="判定"
                options={[
                  { label: "要対応", value: "要対応" },
                  { label: "静観", value: "静観" },
                ]}
                value={judgmentFilter}
                onChange={setJudgmentFilter}
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <Label className="mb-2">担当者</Label>
              <DataTableFacetedFilter
                title="担当者"
                options={Array.from(new Set(incidentsState.map(i => i.assignee))).map(assignee => ({
                  label: assignee,
                  value: assignee,
                }))}
                value={assigneeFilter}
                onChange={setAssigneeFilter}
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <Label className="mb-2">日付範囲</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={`w-full justify-start text-left font-normal ${
                      !dateRange?.from && !dateRange?.to && "text-muted-foreground"
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "PPP", { locale: ja })} -{" "}
                          {format(dateRange.to, "PPP", { locale: ja })}
                        </>
                      ) : (
                        format(dateRange.from, "PPP", { locale: ja })
                      )
                    ) : (
                      <span>日付範囲でフィルター</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex-1 min-w-[200px] relative">
              <Label className="mb-2">検索</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="インシデントを検索"
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end mb-4">
            <Button onClick={resetFilters} variant="outline">
              フィルター解除
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead className="w-[150px]">ステータス</TableHead>
                <TableHead className="w-[100px]">判定</TableHead>
                <TableHead>日時</TableHead>
                <TableHead>内容</TableHead>
                <TableHead>担当者</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIncidents.map((incident) => (
                <TableRow key={incident.id} onClick={() => handleIncidentClick(incident)} className="cursor-pointer hover:bg-gray-100">
                  <TableCell>{incident.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(incident.status)}
                      <Badge
                        variant={
                          incident.status === "未着手"
                            ? "destructive"
                            : incident.status === "調査中"
                            ? "outline"
                            : "secondary"
                        }
                      >
                        {incident.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={incident.judgment === "要対応" ? "destructive" : "secondary"}
                      className={incident.judgment === "静観" ? "bg-white text-green-500 border border-green-500" : ""}
                    >
                      {incident.judgment}
                    </Badge>
                  </TableCell>
                  <TableCell>{incident.datetime}</TableCell>
                  <TableCell>
                    <div className="font-medium">{incident.content.substring(0, 50)}...</div>
                    <div className="text-sm text-muted-foreground">
                      優先度: {incident.priority}
                    </div>
                  </TableCell>
                  <TableCell>{incident.assignee || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[80vw] w-full p-0 h-[95vh]">
          <div className="grid grid-cols-2 h-full">
            <div className="p-6 bg-gray-100 flex flex-col overflow-hidden">
              <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full">
                <Accordion type="single" collapsible className="w-full">
                  {[selectedIncident, ...incidentsState.filter(i => i.id !== selectedIncident?.id)].map((incident, index) => (
                    <AccordionItem value={`item-${index}`} key={incident?.id}>
                      <AccordionTrigger className="px-4 py-2 hover:bg-gray-50">
                        <div className="flex items-center space-x-2 text-left w-full">
                          <MailIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
                          <div className="flex-grow min-w-0">
                            <div className="font-semibold truncate">{incident?.subject}</div>
                            <div className="text-sm text-gray-500 flex justify-between">
                              <span className="truncate">{incident?.from}</span>
                              <span className="flex-shrink-0 ml-2">{incident?.datetime.split(' ')[1]}</span>
                            </div>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="p-4 space-y-2">
                          <div>
                            <span className="font-semibold">From:</span> {incident?.from}
                          </div>
                          <div>
                            <span className="font-semibold">To:</span> {incident?.to}
                          </div>
                          <div>
                            <span className="font-semibold">Date:</span> {incident?.datetime}
                          </div>
                          <Separator className="my-4" />
                          <div className="whitespace-pre-wrap">{incident?.content}</div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
            <div className="p-6 overflow-y-auto h-full">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold">ステータス</h4>
                    <p>{selectedIncident?.status}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">判定</h4>
                    <p>{selectedIncident?.judgment}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">担当者</h4>
                    <p>{selectedIncident?.assignee || "-"}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">優先度</h4>
                    <p>{selectedIncident?.priority}</p>
                  </div>
                </div>
                {selectedIncident?.status !== "解決済み" && (
                  <div>
                    <h4 className="font-semibold mb-2">ステータス更新</h4>
                    <Button onClick={handleStatusUpdate} variant="outline">解決済み</Button>
                  </div>
                )}
                <div>
                  <h4 className="font-semibold mb-2">対応履歴</h4>
                  <div className="max-h-[200px] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>日付</TableHead>
                          <TableHead>対応内容</TableHead>
                          <TableHead>名前</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedIncident?.responses.map((response) => (
                          <TableRow key={response.id}>
                            <TableCell>{response.date}</TableCell>
                            <TableCell>{response.content}</TableCell>
                            <TableCell>{response.responder}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">新規対応記録</h4>
                  <div className="grid gap-2">
                    <Textarea
                      placeholder="対応内容を入力してください"
                      value={newResponse}
                      onChange={(e) => setNewResponse(e.target.value)}
                    />
                    <Input
                      placeholder="名前"
                      value={responderName}
                      onChange={(e) => setResponderName(e.target.value)}
                    />
                    <Button onClick={handleResponseSubmit}>記録を追加</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}