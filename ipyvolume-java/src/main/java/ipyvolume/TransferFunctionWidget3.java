package ipyvolume;

public class TransferFunctionWidget3 extends TransferFunction {



  public static final String LEVEL1 = "level1";
  public static final String LEVEL2 = "level2";
  public static final String LEVEL3 = "level3";
  public static final String OPACITY1 = "opacity1";
  public static final String OPACITY2 = "opacity2";
  public static final String OPACITY3 = "opacity3";
  public static final String WIDTH1 = "width1";
  public static final String WIDTH2 = "width2";
  public static final String WIDTH3 = "width3";

  private double level1 = 0.1;
  private double level2 = 0.5;
  private double level3 = 0.8;
  private double opacity1 = 0.4;
  private double opacity2 = 0.1;
  private double opacity3 = 0.1;
  private double width1 = 0.1;
  private double width2 = 0.1;
  private double width3 = 0.1;

  public TransferFunctionWidget3() {
    super();
    openComm();
  }

  public double getLevel1() {
    return level1;
  }
  public void setLevel1(double level1){
    this.level1 = level1;
    sendUpdate(LEVEL1, level1);
  }

  public double getLevel2() {
    return level2;
  }
  public void setLevel2(double level2){
    this.level2 = level2;
    sendUpdate(LEVEL2, level2);
  }

  public double getLevel3() {
    return level3;
  }
  public void setLevel3(double level3){
    this.level3 = level3;
    sendUpdate(LEVEL3, level3);
  }

  public double getOpacity1() {
    return opacity1;
  }
  public void setOpacity1(double opacity1){
    this.opacity1 = opacity1;
    sendUpdate(OPACITY1, opacity1);
  }

  public double getOpacity2() {
    return opacity2;
  }
  public void setOpacity2(double opacity2){
    this.opacity2 = opacity2;
    sendUpdate(OPACITY2, opacity2);
  }

  public double getOpacity3() {
    return opacity3;
  }
  public void setOpacity3(double opacity3){
    this.opacity3 = opacity3;
    sendUpdate(OPACITY3, opacity3);
  }

  public double getWidth1() {
    return width1;
  }
  public void setWidth1(double width1){
    this.width1 = width1;
    sendUpdate(WIDTH1, width1);
  }

  public double getWidth2() {
    return width2;
  }
  public void setWidth2(double width2){
    this.width2 = width2;
    sendUpdate(WIDTH2, width2);
  }

  public double getWidth3() {
    return width3;
  }
  public void setWidth3(double width3){
    this.width3 = width3;
    sendUpdate(WIDTH3, width3);
  }

}
