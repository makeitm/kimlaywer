import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-secondary">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2 items-center">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <h1 className="text-2xl font-bold text-primary">404 페이지를 찾을 수 없습니다</h1>
          </div>

          <p className="mt-4 mb-6 text-muted-foreground">
            요청하신 페이지를 찾을 수 없습니다. 주소를 확인하시거나 홈으로 돌아가세요.
          </p>
          
          <Link href="/">
            <Button className="w-full">홈으로 돌아가기</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
