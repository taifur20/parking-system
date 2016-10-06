package cloud.artik.example.hellocloud;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;

public class MainActivity extends Activity {
    static final String TAG = "MainActivity";
    private static final String ARTIK_CLOUD_AUTH_BASE_URL = "https://accounts.artik.cloud";
    private static final String CLIENT_ID = "c45489f3a08e46c5bdf489ff5ed377a8";// AKA application id
    private static final String REDIRECT_URL = "http://localhost:8000/acdemo/index.php";

    private View mLoginView;
    private WebView mWebView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        mWebView = (WebView)findViewById(R.id.webview);
        mWebView.setVisibility(View.GONE);
        mLoginView = findViewById(R.id.ask_for_login);
        mLoginView.setVisibility(View.VISIBLE);
        Button button = (Button)findViewById(R.id.btn);

        Log.v(TAG, "::onCreate");
        button.setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {
                try {
                    Log.v(TAG, ": button is clicked.");
                    loadWebView();
                } catch (Exception e) {
                    Log.v(TAG, "Run into Exception");
                    e.printStackTrace();
                }
            }
        });

    }

    @SuppressLint("SetJavaScriptEnabled")
    private void loadWebView() {
        Log.v(TAG, "::loadWebView");
        mLoginView.setVisibility(View.GONE);
        mWebView.setVisibility(View.VISIBLE);
        mWebView.getSettings().setJavaScriptEnabled(true);
        
        mWebView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String uri) {
                if ( uri.startsWith(REDIRECT_URL) ) {
                    // Redirect URL has format http://localhost:8000/acdemo/index.php#expires_in=1209600&token_type=bearer&access_token=xxxx
                    // Extract OAuth2 access_token in URL
                    String[] sArray = uri.split("&");
                    for (String paramVal : sArray) {
                        if (paramVal.indexOf("access_token=") != -1) {
                            String[] paramValArray = paramVal.split("access_token=");
                            String accessToken = paramValArray[1];
                            startMessageActivity(accessToken);
                            break;
                        }
                    }
                    return true;
                }
                // Load the web page from URL (login and grant access)
                return super.shouldOverrideUrlLoading(view, uri);
            }
        });
        
        String url = getAuthorizationRequestUri();
        Log.v(TAG, "webview loading url: " + url);
        mWebView.loadUrl(url);
    }
    
    public String getAuthorizationRequestUri() {
        //https://accounts.artik.cloud/authorize?client=mobile&client_id=xxxx&response_type=token&redirect_uri=http://localhost:8000/acdemo/index.php
        return ARTIK_CLOUD_AUTH_BASE_URL + "/authorize?client=mobile&response_type=token&" +
                     "client_id=" + CLIENT_ID + "&redirect_uri=" + REDIRECT_URL;
    }
    
    private void startMessageActivity(String accessToken) {
        Intent rmsgActivityIntent = new Intent(this, MessageActivity.class);
        Intent imsgActivityIntent = new Intent(this, MessageActivity.class);
        rmsgActivityIntent.putExtra(MessageActivity.RKEY_ACCESS_TOKEN, accessToken);
        imsgActivityIntent.putExtra(MessageActivity.IKEY_ACCESS_TOKEN, accessToken);
        startActivity(rmsgActivityIntent);
        startActivity(imsgActivityIntent);
    }
}
