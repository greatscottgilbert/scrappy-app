package ca.autojobhunter.app;
import android.app.Activity;
import android.os.Bundle;
import android.content.Intent;
import android.net.Uri;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
public class MainActivity extends Activity {
 private WebView web;
 @Override public void onCreate(Bundle saved) {
  super.onCreate(saved);
  web=new WebView(this);
  web.getSettings().setJavaScriptEnabled(true);
  web.getSettings().setDomStorageEnabled(true);
  web.getSettings().setAllowFileAccess(true);
  web.getSettings().setAllowFileAccessFromFileURLs(false);
  web.getSettings().setAllowUniversalAccessFromFileURLs(false);
  web.getSettings().setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
  web.setWebViewClient(new WebViewClient(){
   @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) {
    Uri u=req.getUrl();
    if("file".equals(u.getScheme()) && (u.getHost()==null || u.getHost().isEmpty())) return false;
    if("https".equals(u.getScheme())) startActivity(new Intent(Intent.ACTION_VIEW,u));
    return true;
   }
  });
  setContentView(web);
  web.loadUrl("file:///android_asset/index.html");
 }
 @Override protected void onDestroy(){if(web!=null){web.destroy();web=null;}super.onDestroy();}
}