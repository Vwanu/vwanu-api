#!/bin/bash

echo "===== Testing connectivity to ALB ====="
curl -v http://app-lb-1222210323.us-east-1.elb.amazonaws.com/

echo ""
echo "===== Testing with different User-Agent ====="
curl -v -A "Mozilla/5.0" http://app-lb-1222210323.us-east-1.elb.amazonaws.com/

echo ""
echo "===== Checking ALB target health ====="
echo "Check the AWS Console: EC2 > Target Groups > app-target-group > Targets"
echo "Look for the status of your targets and any health check failures" 