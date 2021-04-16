package ipywebrtc;


public class WebRTCRoomLocal extends WebRTCRoom {



  public static final String MODEL_NAME_VALUE = "WebRTCRoomLocalModel";


  public WebRTCRoomLocal() {
    super();
    openComm();
  }

  public String getModelNameValue(){
    return MODEL_NAME_VALUE;
  }

}
