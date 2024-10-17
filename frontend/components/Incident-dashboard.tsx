"use client"

import * as React from "react"
import { AlertCircle, CheckCircle, Clock, XCircle, Search, Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { ja } from "date-fns/locale"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

const incidents = [
  {
    id: 1,
    datetime: "2023-05-15 14:30",
    status: "未解決",
    judgment: "要対応",
    content: "データベース接続エラー",
    assignee: "山田太郎",
    priority: "高",
  },
  {
    id: 2,
    datetime: "2023-05-15 11:45",
    status: "調査中",
    judgment: "要対応",
    content: "アプリケーションの応答遅延",
    assignee: "佐藤花子",
    priority: "中",
  },
  {
    id: 3,
    datetime: "2023-05-14 23:15",
    status: "解決済み",
    judgment: "静観",
    content: "ユーザー認証の問題",
    assignee: "鈴木一郎",
    priority: "低",
  },
  {
    id: 4,
    datetime: "2023-05-14 18:00",
    status: "クローズ",
    judgment: "静観",
    content: "バックアップ失敗",
    assignee: "高橋次郎",
    priority: "中",
  },
]

const getStatusIcon = (status: string) => {
  switch (status) {
    case "未解決":
      return <AlertCircle className="h-5 w-5 text-red-500" />
    case "調査中":
      return <Clock className="h-5 w-5 text-yellow-500" />
    case "解決済み":
      return <CheckCircle className="h-5 w-5 text-green-500" />
    case "クローズ":
      return <XCircle className="h-5 w-5 text-gray-500" />
    default:
      return null
  }
}

export function IncidentDashboard() {
  const [statusFilter, setStatusFilter] = React.useState("全て")
  const [judgmentFilter, setJudgmentFilter] = React.useState("全て")
  const [assigneeFilter, setAssigneeFilter] = React.useState("全て")
  const [dateFilter, setDateFilter] = React.useState<Date | undefined>(undefined)
  const [searchQuery, setSearchQuery] = React.useState("")

  const filteredIncidents = incidents.filter((incident) => {
    const matchesStatus = statusFilter === "全て" || incident.status === statusFilter
    const matchesJudgment = judgmentFilter === "全て" || incident.judgment === judgmentFilter
    const matchesAssignee = assigneeFilter === "全て" || incident.assignee === assigneeFilter
    const matchesDate = !dateFilter || incident.datetime.startsWith(format(dateFilter, "yyyy-MM-dd"))
    const matchesSearch = incident.content.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesJudgment && matchesAssignee && matchesDate && matchesSearch
  })

  const unresolved = incidents.filter(i => i.status === "未解決").length
  const investigating = incidents.filter(i => i.status === "調査中").length

  const uniqueAssignees = Array.from(new Set(incidents.map(i => i.assignee)))

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="col-span-1 md:col-span-1">
        <CardHeader>
          <CardTitle>未解決インシデント</CardTitle>
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
          <p className="text-sm text-muted-foreground">件</p>
        </CardContent>
      </Card>
      <Card className="col-span-2 md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle>最近のインシデント</CardTitle>
          <CardDescription>
            過去24時間以内に報告されたインシデント
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-4 items-start">
            <div className="flex-1 min-w-[200px] h-10">
              <Select onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="ステータスでフィルター" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="全て">全てのステータス</SelectItem>
                  <SelectItem value="未解決">未解決</SelectItem>
                  <SelectItem value="調査中">調査中</SelectItem>
                  <SelectItem value="解決済み">解決済み</SelectItem>
                  <SelectItem value="クローズ">クローズ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[200px] h-10">
              <Select onValueChange={setJudgmentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="判定でフィルター" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="全て">全ての判定</SelectItem>
                  <SelectItem value="要対応">要対応</SelectItem>
                  <SelectItem value="静観">静観</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[200px] h-10">
              <Select onValueChange={setAssigneeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="担当者でフィルター" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="全て">全ての担当者</SelectItem>
                  {uniqueAssignees.map((assignee) => (
                    <SelectItem key={assignee} value={assignee}>
                      {assignee}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[200px] h-10">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={`w-full justify-start text-left font-normal h-10 ${
                      !dateFilter && "text-muted-foreground"
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFilter ? format(dateFilter, "PPP", { locale: ja }) : <span>日付でフィルター</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateFilter}
                    onSelect={setDateFilter}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex-1 min-w-[200px] h-10 relative">
              <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="インシデントを検索"
                className="pl-8 h-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ステータス</TableHead>
                <TableHead className="w-[100px]">判定</TableHead>
                <TableHead>日時</TableHead>
                <TableHead>内容</TableHead>
                <TableHead>担当者</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIncidents.map((incident) => (
                <TableRow key={incident.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(incident.status)}
                      <Badge
                        variant={
                          incident.status === "未解決"
                            ? "destructive"
                            : incident.status === "調査中"
                            ? "outline"
                            : incident.status === "解決済み"
                            ? "secondary"
                            : "default"
                        }
                      >
                        {incident.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={incident.judgment === "要対応" ? "destructive" : "success"}
                    >
                      {incident.judgment}
                    </Badge>
                  </TableCell>
                  <TableCell>{incident.datetime}</TableCell>
                  <TableCell>
                    <div className="font-medium">{incident.content}</div>
                    <div className="text-sm text-muted-foreground">
                      優先度: {incident.priority}
                    </div>
                  </TableCell>
                  <TableCell>{incident.assignee}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}