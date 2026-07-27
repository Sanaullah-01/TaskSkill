'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import { enrollMfaAction, verifyMfaSetupAction, unenrollMfaAction } from '../actions/mfa.actions';
import { Loader2, Copy, Check, ShieldCheck, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface TwoFactorSetupProps {
  isEnrolled: boolean;
}

export function TwoFactorSetup({ isEnrolled: initialIsEnrolled }: TwoFactorSetupProps) {
  const [isEnrolled, setIsEnrolled] = React.useState(initialIsEnrolled);
  const [isPending, startTransition] = React.useTransition();
  const [setupData, setSetupData] = React.useState<{ factorId: string; qrCode: string; secret: string } | null>(null);
  const [code, setCode] = React.useState('');
  const [copied, setCopied] = React.useState(false);
  
  // Recovery codes modal
  const [recoveryCodes, setRecoveryCodes] = React.useState<string[] | null>(null);

  const handleEnroll = () => {
    startTransition(async () => {
      const result = await enrollMfaAction();
      if (result.error) {
        toast.error(result.error);
        return;
      }
      if (result.factorId && result.qrCode && result.secret) {
        setSetupData({ factorId: result.factorId, qrCode: result.qrCode, secret: result.secret });
      }
    });
  };

  const handleVerify = () => {
    if (!setupData || code.length < 6) return;
    
    startTransition(async () => {
      const result = await verifyMfaSetupAction(setupData.factorId, code);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      
      toast.success('Two-factor authentication enabled successfully!');
      setIsEnrolled(true);
      setSetupData(null);
      setCode('');
      
      if (result.recoveryCodes) {
        setRecoveryCodes(result.recoveryCodes);
      }
    });
  };

  const handleDisable = () => {
    if (!confirm('Are you sure you want to disable 2FA? This will decrease your account security.')) return;
    
    startTransition(async () => {
      const result = await unenrollMfaAction();
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success('Two-factor authentication disabled.');
      setIsEnrolled(false);
    });
  };

  const copySecret = () => {
    if (setupData?.secret) {
      navigator.clipboard.writeText(setupData.secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Secret copied to clipboard');
    }
  };

  const copyRecoveryCodes = () => {
    if (recoveryCodes) {
      navigator.clipboard.writeText(recoveryCodes.join('\n'));
      toast.success('Recovery codes copied to clipboard');
    }
  };

  const downloadRecoveryCodes = () => {
    if (!recoveryCodes) return;
    const element = document.createElement("a");
    const file = new Blob([`TaskSkill Recovery Codes\n\n${recoveryCodes.join('\n')}\n\nKeep these safe. Each code can only be used once.`], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "taskskill-recovery-codes.txt";
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
    document.body.removeChild(element);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Two-Factor Authentication (2FA)
                {isEnrolled ? (
                  <ShieldCheck className="h-5 w-5 text-green-500" />
                ) : (
                  <ShieldAlert className="h-5 w-5 text-muted-foreground" />
                )}
              </CardTitle>
              <CardDescription>
                Add an extra layer of security to your account.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isEnrolled ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Two-factor authentication is currently enabled on your account. When logging in, you will be required to enter a code from your authenticator app.
              </p>
              <Button variant="destructive" onClick={handleDisable} disabled={isPending}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Disable 2FA
              </Button>
            </div>
          ) : setupData ? (
            <div className="space-y-6">
              <div className="rounded-md border p-4 bg-muted/30">
                <h4 className="text-sm font-medium mb-4">1. Scan this QR code</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Open your authenticator app (like Google Authenticator or Authy) and scan this QR code.
                </p>
                <div className="flex justify-center bg-white p-4 rounded-md max-w-[200px] mx-auto mb-4">
                  <QRCodeSVG value={setupData.qrCode} size={150} />
                </div>
                
                <div className="text-center mt-4">
                  <p className="text-xs text-muted-foreground mb-2">Can't scan the QR code? Enter this secret manually:</p>
                  <div className="flex items-center justify-center gap-2">
                    <code className="bg-muted px-2 py-1 rounded text-xs font-mono tracking-widest">{setupData.secret}</code>
                    <Button variant="ghost" size="icon" onClick={copySecret} className="h-6 w-6">
                      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="rounded-md border p-4">
                <h4 className="text-sm font-medium mb-4">2. Enter the 6-digit code</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Enter the code generated by your app to verify the setup.
                </p>
                <div className="flex gap-2 max-w-xs">
                  <Input 
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    className="text-center tracking-[0.5em] text-lg font-mono"
                  />
                  <Button onClick={handleVerify} disabled={isPending || code.length !== 6}>
                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Verify'}
                  </Button>
                </div>
              </div>
              
              <Button variant="ghost" onClick={() => setSetupData(null)}>Cancel Setup</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Protect your account against unauthorized access by requiring a second authentication method in addition to your password.
              </p>
              <Button onClick={handleEnroll} disabled={isPending}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Enable 2FA
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!recoveryCodes} onOpenChange={(open) => !open && setRecoveryCodes(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save Recovery Codes</DialogTitle>
            <DialogDescription>
              If you lose access to your authenticator app, you can use these recovery codes to access your account. 
              <br/><br/>
              <span className="font-semibold text-destructive">This is the ONLY time they will be shown.</span> Please download or copy them and keep them in a safe place.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-2 bg-muted p-4 rounded-md font-mono text-sm">
            {recoveryCodes?.map((code, i) => (
              <div key={i} className="text-center py-1">{code}</div>
            ))}
          </div>

          <DialogFooter className="sm:justify-between">
            <Button type="button" variant="outline" onClick={copyRecoveryCodes}>
              Copy to Clipboard
            </Button>
            <Button type="button" onClick={downloadRecoveryCodes}>
              Download .txt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
