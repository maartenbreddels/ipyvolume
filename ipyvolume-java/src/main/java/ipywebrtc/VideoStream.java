package ipywebrtc;

public class VideoStream extends MediaStream {



  public static final String MODEL_NAME_VALUE = "VideoStreamModel";
  public static final String DATA = "data";
  public static final String LOOP = "loop";
  public static final String PLAY = "play";
  public static final String URL = "url";

  private Object data = null;
  private boolean loop = true;
  private boolean play = true;
  private String url = "https://webrtc.github.io/samples/src/video/chrome.mp4";

  public VideoStream() {
    super();
    openComm();
  }

  public String getModelNameValue(){
    return MODEL_NAME_VALUE;
  }

  public Object getData() {
    return data;
  }
  public void setData(Object data){
    this.data = data;
    sendUpdate(DATA, data);
  }

  public boolean getLoop() {
    return loop;
  }
  public void setLoop(boolean loop){
    this.loop = loop;
    sendUpdate(LOOP, loop);
  }

  public boolean getPlay() {
    return play;
  }
  public void setPlay(boolean play){
    this.play = play;
    sendUpdate(PLAY, play);
  }

  public String getUrl() {
    return url;
  }
  public void setUrl(String url){
    this.url = url;
    sendUpdate(URL, url);
  }

}
