package ipywebrtc;


public class WebRTCPeer extends MediaStream {



  public static final String MODEL_MODULE_VALUE = "jupyter-webrtc";
  public static final String MODEL_NAME_VALUE = "WebRTCPeerModel";
  public static final String VIEW_MODULE_VALUE = "jupyter-webrtc";
  public static final String VIEW_NAME_VALUE = "WebRTCPeerView";
  public static final String CONNECTED = "connected";
  public static final String FAILED = "failed";
  public static final String ID_LOCAL = "id_local";
  public static final String ID_REMOTE = "id_remote";
  public static final String STREAM_LOCAL = "stream_local";
  public static final String STREAM_REMOTE = "stream_remote";

  private boolean connected = false;
  private boolean failed = false;
  private String idLocal = "lala";
  private String idRemote = "lala";
  private Object streamLocal = null;
  private Object streamRemote = null;

  public WebRTCPeer() {
    super();
    openComm();
  }

  public String getModelModuleValue(){
    return MODEL_MODULE_VALUE;
  }

  public String getModelNameValue(){
    return MODEL_NAME_VALUE;
  }

  public String getViewModuleValue(){
    return VIEW_MODULE_VALUE;
  }

  public String getViewNameValue(){
    return VIEW_NAME_VALUE;
  }

  public boolean getConnected() {
    return connected;
  }
  public void setConnected(boolean connected){
    this.connected = connected;
    sendUpdate(CONNECTED, connected);
  }

  public boolean getFailed() {
    return failed;
  }
  public void setFailed(boolean failed){
    this.failed = failed;
    sendUpdate(FAILED, failed);
  }

  public String getIdLocal() {
    return idLocal;
  }
  public void setIdLocal(String idLocal){
    this.idLocal = idLocal;
    sendUpdate(ID_LOCAL, idLocal);
  }

  public String getIdRemote() {
    return idRemote;
  }
  public void setIdRemote(String idRemote){
    this.idRemote = idRemote;
    sendUpdate(ID_REMOTE, idRemote);
  }

  public Object getStreamLocal() {
    return streamLocal;
  }
  public void setStreamLocal(Object streamLocal){
    this.streamLocal = streamLocal;
    sendUpdate(STREAM_LOCAL, streamLocal);
  }

  public Object getStreamRemote() {
    return streamRemote;
  }
  public void setStreamRemote(Object streamRemote){
    this.streamRemote = streamRemote;
    sendUpdate(STREAM_REMOTE, streamRemote);
  }

}
