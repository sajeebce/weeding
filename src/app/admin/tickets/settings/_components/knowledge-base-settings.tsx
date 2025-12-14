"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Upload,
  FileText,
  Trash2,
  RefreshCw,
  BookOpen,
  Database,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface KnowledgeBaseSettingsProps {
  onChangeDetected: () => void;
}

// Mock documents
const mockDocuments = [
  {
    id: "1",
    name: "LLC Formation Guide.pdf",
    size: "2.4 MB",
    pages: 45,
    uploadedAt: "2024-12-10",
    status: "indexed",
    chunks: 128,
  },
  {
    id: "2",
    name: "EIN Application FAQ.docx",
    size: "856 KB",
    pages: 12,
    uploadedAt: "2024-12-08",
    status: "indexed",
    chunks: 34,
  },
  {
    id: "3",
    name: "Amazon Seller Onboarding.pdf",
    size: "1.8 MB",
    pages: 28,
    uploadedAt: "2024-12-05",
    status: "processing",
    chunks: 0,
  },
];

export function KnowledgeBaseSettings({ onChangeDetected }: KnowledgeBaseSettingsProps) {
  return (
    <div className="space-y-8">
      {/* Coming Soon Notice */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Coming Soon</AlertTitle>
        <AlertDescription>
          Knowledge Base feature is currently under development. This will allow you to upload
          documents that the AI assistant can use to answer customer questions automatically.
        </AlertDescription>
      </Alert>

      {/* Feature Overview */}
      <div className="rounded-lg border bg-gradient-to-br from-primary/5 to-primary/10 p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-primary/10 p-3">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">AI-Powered Knowledge Base</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Upload your documentation, FAQs, and guides. Our AI will learn from these
              documents and provide accurate answers to customer questions automatically.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="secondary">
                <FileText className="mr-1 h-3 w-3" />
                PDF Support
              </Badge>
              <Badge variant="secondary">
                <FileText className="mr-1 h-3 w-3" />
                Word Docs
              </Badge>
              <Badge variant="secondary">
                <Database className="mr-1 h-3 w-3" />
                Vector Search
              </Badge>
              <Badge variant="secondary">
                <Sparkles className="mr-1 h-3 w-3" />
                AI Answers
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Upload Section */}
      <div className="space-y-4 opacity-60 pointer-events-none">
        <div>
          <Label className="text-base">Upload Documents</Label>
          <p className="text-sm text-muted-foreground">
            Upload PDF, Word, or text files for AI training
          </p>
        </div>

        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="font-medium">Drop files here or click to upload</p>
          <p className="text-sm text-muted-foreground mt-1">
            Supports PDF, DOCX, TXT (max 50MB per file)
          </p>
          <Button className="mt-4" variant="outline" disabled>
            Choose Files
          </Button>
        </div>
      </div>

      <Separator />

      {/* Document List */}
      <div className="space-y-4 opacity-60 pointer-events-none">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base">Uploaded Documents</Label>
            <p className="text-sm text-muted-foreground">
              Documents indexed for AI knowledge
            </p>
          </div>
          <Button variant="outline" size="sm" disabled>
            <RefreshCw className="mr-2 h-4 w-4" />
            Re-index All
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead className="hidden sm:table-cell">Size</TableHead>
                <TableHead className="hidden md:table-cell">Chunks</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockDocuments.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {doc.pages} pages • Uploaded {doc.uploadedAt}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{doc.size}</TableCell>
                  <TableCell className="hidden md:table-cell">{doc.chunks}</TableCell>
                  <TableCell>
                    {doc.status === "indexed" ? (
                      <Badge variant="default" className="bg-green-600">Indexed</Badge>
                    ) : (
                      <Badge variant="secondary">Processing...</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" disabled>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Separator />

      {/* Index Settings */}
      <div className="space-y-4 opacity-60 pointer-events-none">
        <div>
          <Label className="text-base">Indexing Settings</Label>
          <p className="text-sm text-muted-foreground">
            Configure how documents are processed
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Chunk Size</Label>
            <Select defaultValue="500" disabled>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="250">250 tokens (More granular)</SelectItem>
                <SelectItem value="500">500 tokens (Balanced)</SelectItem>
                <SelectItem value="1000">1000 tokens (More context)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Overlap</Label>
            <Select defaultValue="50" disabled>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25">25 tokens</SelectItem>
                <SelectItem value="50">50 tokens</SelectItem>
                <SelectItem value="100">100 tokens</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label>Auto-reindex on Update</Label>
            <p className="text-xs text-muted-foreground">
              Re-process documents when they're updated
            </p>
          </div>
          <Switch defaultChecked disabled />
        </div>
      </div>

      <Separator />

      {/* Storage Usage */}
      <div className="space-y-4 opacity-60">
        <div>
          <Label className="text-base">Storage Usage</Label>
          <p className="text-sm text-muted-foreground">
            Knowledge base storage and limits
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Documents: 3 / 50</span>
            <span>5.1 MB / 500 MB</span>
          </div>
          <Progress value={6} className="h-2" />
          <p className="text-xs text-muted-foreground">
            162 total chunks indexed
          </p>
        </div>
      </div>
    </div>
  );
}
