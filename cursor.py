#! /usr/bin/python2.7
from pymouse import PyMouse 
import time
def _main():
	while 1<2:	
		m=PyMouse();
		print m.position();	       
		time.sleep(2);
_main();
