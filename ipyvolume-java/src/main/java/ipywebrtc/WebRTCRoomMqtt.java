package ipywebrtc;


public class WebRTCRoomMqtt extends WebRTCRoom {



  public static final String MODEL_NAME_VALUE = "WebRTCRoomMqttModel";
  public static final String SERVER = "server";

  private String server = "wss://iot.eclipse.org:443/ws";

  public WebRTCRoomMqtt() {
    super();
    openComm();
  }

  public String getModelNameValue(){
    return MODEL_NAME_VALUE;
  }

  public String getServer() {
    return server;
  }
  public void setServer(String server){
    this.server = server;
    sendUpdate(SERVER, server);
  }

}
