package cloud.artik.example.hellocloud;

import android.app.Activity;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import cloud.artik.api.MessagesApi;
import cloud.artik.api.UsersApi;
import cloud.artik.client.ApiCallback;
import cloud.artik.client.ApiClient;
import cloud.artik.client.ApiException;
import cloud.artik.model.MessageAction;
import cloud.artik.model.MessageIDEnvelope;
import cloud.artik.model.NormalizedMessagesEnvelope;
import cloud.artik.model.UserEnvelope;

public class MessageActivity extends Activity {
    private static final String TAG = "MessageActivity";

    private static final String RDEVICE_ID = "Your Device ID";
    public static final String RKEY_ACCESS_TOKEN = "Your Device Token";  // r set
    private static final String IDEVICE_ID = "Another Device ID";
    public static final String IKEY_ACCESS_TOKEN = "Another Device Token";  // r set



    private MessagesApi rMessagesApi = null; // r set
    private MessagesApi iMessagesApi = null; // r set
    

    private String rAccessToken;    // r set
    private String iAccessToken;    // r set

    private TextView rainbowLot;
    private TextView indigoLot;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_message);

        rAccessToken = getIntent().getStringExtra(RKEY_ACCESS_TOKEN);   // r set
        iAccessToken = getIntent().getStringExtra(IKEY_ACCESS_TOKEN);   // r set

        Button getLatestMsgBtn = (Button)findViewById(R.id.getlatest_btn);

        rainbowLot = (TextView)findViewById(R.id.txtRlot);
        indigoLot = (TextView)findViewById(R.id.txtIlot);
        
        setupArtikCloudApi();

        getLatestMsgBtn.setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {

                // Now get the message
                //getRainbowMsg();
                getIndigoMsg();
            }
        });
    }

    private void setupArtikCloudApi() {
        ApiClient rApiClient = new ApiClient();
        ApiClient iApiClient = new ApiClient();

        rApiClient.setAccessToken(rAccessToken);   // r set
        iApiClient.setAccessToken(iAccessToken);   // r set

        rMessagesApi = new MessagesApi(rApiClient);  // r set
        iMessagesApi = new MessagesApi(iApiClient);  // r set
    }

    private void getRainbowMsg() {
        final String tag = TAG + " getLastNormalizedMessagesAsync";
        try {
            int messageCount = 2;
            rMessagesApi.getLastNormalizedMessagesAsync(messageCount, RDEVICE_ID, null,
                    new ApiCallback<NormalizedMessagesEnvelope>() {
                        @Override
                        public void onFailure(ApiException exc, int i, Map<String, List<String>> stringListMap) {
                            processFailure(tag, exc);
                        }

                        @Override
                        public void onSuccess(NormalizedMessagesEnvelope result, int i, Map<String, List<String>> stringListMap) {
                            Log.v(tag, " onSuccess latestMessage = " + result.getData().toString());
                            updateGetResponseOnUIThread(result.getData().get(0).getMid(), result.getData().get(0).getData().toString());
                        }

                        @Override
                        public void onUploadProgress(long bytes, long contentLen, boolean done) {
                        }

                        @Override
                        public void onDownloadProgress(long bytes, long contentLen, boolean done) {
                        }
                    });

        } catch (ApiException exc) {
            processFailure(tag, exc);
        }
    }

    private void getIndigoMsg() {
        final String tag = TAG + " getLastNormalizedMessagesAsync";
        try {
            int messageCount = 1;
            iMessagesApi.getLastNormalizedMessagesAsync(messageCount, IDEVICE_ID, null,
                    new ApiCallback<NormalizedMessagesEnvelope>() {
                        @Override
                        public void onFailure(ApiException exc, int i, Map<String, List<String>> stringListMap) {
                            processFailure(tag, exc);
                        }

                        @Override
                        public void onSuccess(NormalizedMessagesEnvelope result, int i, Map<String, List<String>> stringListMap) {
                            Log.v(tag, " onSuccess latestMessage = " + result.getData().toString());
                            updateGetResponseOnUIThread(result.getData().get(0).getMid(), result.getData().get(0).getData().toString());
                        }

                        @Override
                        public void onUploadProgress(long bytes, long contentLen, boolean done) {
                        }

                        @Override
                        public void onDownloadProgress(long bytes, long contentLen, boolean done) {
                        }
                    });

        } catch (ApiException exc) {
            processFailure(tag, exc);
        }
    }

    static void showErrorOnUIThread(final String text, final Activity activity) {
        activity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                int duration = Toast.LENGTH_LONG;
                Toast toast = Toast.makeText(activity.getApplicationContext(), text, duration);
                toast.show();
            }
        });
    }


    private void updateGetResponseOnUIThread(final String mid, final String msgData) {
        this.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                String delims = "[=}.]+";
                String[] tokens = msgData.split(delims);
                //rainbowLot.setText(tokens[1]);
                indigoLot.setText(tokens[1]);
            }
        });
    }

    private void processFailure(final String context, ApiException exc) {
        String errorDetail = " onFailure with exception" + exc;
        Log.w(context, errorDetail);
        exc.printStackTrace();
        showErrorOnUIThread(context+errorDetail, MessageActivity.this);
    }

} //MessageActivity

