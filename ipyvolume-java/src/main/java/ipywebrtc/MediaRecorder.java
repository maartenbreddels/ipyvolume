package ipywebrtc;


import com.twosigma.beakerx.widget.Widget;

import java.io.Serializable;
import java.util.HashMap;

public class MediaRecorder extends Widget {



  public static final String MODEL_MODULE_VALUE = "jupyter-webrtc";
  public static final String MODEL_MODULE_VERSION_VALUE = "~0.3.0";
  public static final String MODEL_NAME_VALUE = "MediaRecorderModel";
  public static final String DATA = "data";
  public static final String MIME_TYPE = "mime_type";
  public static final String RECORD = "record";
  public static final String STREAM = "stream";

  private Object data = null;
  private String mimeType = "video/webm";
  private boolean record = false;
  private Object stream = null;

  public MediaRecorder() {
    super();
    openComm();
  }

  public String getModelModuleValue(){
    return MODEL_MODULE_VALUE;
  }

  @Override
  protected void addValueChangeMsgCallback() {

  }

  @Override
  protected HashMap<String, Serializable> content(HashMap<String, Serializable> content) {
    return null;
  }

  public String getModelModuleVersionValue(){
    return MODEL_MODULE_VERSION_VALUE;
  }

  public String getModelNameValue(){
    return MODEL_NAME_VALUE;
  }

  @Override
  public String getViewNameValue() {
    return null;
  }

  public Object getData() {
    return data;
  }
  public void setData(Object data){
    this.data = data;
    sendUpdate(DATA, data);
  }

  public String getMimeType() {
    return mimeType;
  }
  public void setMimeType(String mimeType){
    this.mimeType = mimeType;
    sendUpdate(MIME_TYPE, mimeType);
  }

  public boolean getRecord() {
    return record;
  }
  public void setRecord(boolean record){
    this.record = record;
    sendUpdate(RECORD, record);
  }

  public Object getStream() {
    return stream;
  }
  public void setStream(Object stream){
    this.stream = stream;
    sendUpdate(STREAM, stream);
  }

}
