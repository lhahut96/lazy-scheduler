import logging
import time

from app.pdf_parser.utils.cache_utils import cache

logger = logging.getLogger("PdfParser")

AWS_DEFAULT_REGION = "us-west-2"


@cache("TextractClient")
def _get_textract_client(boto3=None):
    return boto3.client("textract", region_name=AWS_DEFAULT_REGION)


def _start_job(bucket_name, bucket_path):
    client = _get_textract_client()
    response = client.start_document_analysis(
        DocumentLocation={"S3Object": {"Bucket": bucket_name, "Name": bucket_path}},
        FeatureTypes=["TABLES"],
    )
    return response["JobId"]


def _sleep_between_requests(num_pages, check_count):
    if check_count == 1:
        time.sleep(num_pages)
    else:
        time.sleep(5)


def _get_job_result(job_id, num_pages):
    pages = []

    client = _get_textract_client()
    response = client.get_document_analysis(JobId=job_id)
    status = response["JobStatus"]
    logger.debug(f"Job status: {status}")

    check_count = 1
    while status == "IN_PROGRESS":
        _sleep_between_requests(check_count=check_count, num_pages=num_pages)
        response = client.get_document_analysis(JobId=job_id)
        status = response["JobStatus"]
        check_count += 1
        logger.debug(f"Job status: {status}")

    pages.append(response)
    logger.debug(f"Page received: {len(pages)}")
    next_token = response.get("NextToken")

    while next_token:
        response = client.get_document_analysis(JobId=job_id, NextToken=next_token)
        pages.append(response)
        logger.debug(f"Page received: {len(pages)}")
        next_token = response.get("NextToken")

    return pages


def read_schedule(input_path):
    job_id = _start_job(
        bucket_name=get_nlp_workbench_s3_bucket(), bucket_path=bucket_path
    )

    pages = _get_job_result(job_id=job_id, num_pages=len(page_size_map))

