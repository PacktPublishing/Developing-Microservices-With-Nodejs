public interface GeoIpService {
   /**
    * Checks if an IP is in the country given by an ISO code.
    **/
	boolean isIn(String ip, String isoCode) throws SOAPFaultException;
}

