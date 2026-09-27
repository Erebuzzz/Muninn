package com.muninn.livingmemory;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(ForegroundRecordingPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
